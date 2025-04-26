import os
import re
from typing import Dict, Any, List, Tuple
import logging
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from app.config import settings

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        logger.info("Initializing OCR model...")
        self.model = ocr_predictor(pretrained=True)
        logger.info("OCR model initialized successfully")
    
    def process_document(self, file_path: str) -> str:
        """Process document and extract text with improved layout preservation."""
        logger.info(f"Processing document: {file_path}")
        
        try:
            # Determine document type and load it
            doc = (DocumentFile.from_pdf(file_path) if file_path.endswith('.pdf') 
                  else DocumentFile.from_images(file_path))
            
            # Perform OCR
            logger.debug("Running OCR prediction")
            result = self.model(doc)
            
            # Extract structured text with enhanced layout awareness
            full_text = self._extract_enhanced_formatted_text(result.export())
            
            # Log success and text sample
            logger.info(f"OCR completed successfully, extracted {len(full_text)} characters")
            logger.debug(f"Sample text (first 200 chars): {full_text[:200]}...")
            
            return full_text
        
        except Exception as e:
            logger.error(f"OCR error: {str(e)}", exc_info=True)
            raise Exception(f"OCR-fejl: {str(e)}")
        finally:
            # Cleanup temporary files based on environment
            if hasattr(settings, 'DEBUG') and not settings.DEBUG and os.path.exists(file_path):
                 os.remove(file_path)
                 logger.debug(f"Removed temporary file: {file_path}")
            elif not hasattr(settings, 'DEBUG') and os.path.exists(file_path):
                 os.remove(file_path)
                 logger.debug(f"Removed temporary file: {file_path}")
    
    def _extract_enhanced_formatted_text(self, extracted_data: Dict) -> str:
        """
        Enhanced text extraction with specialized formatting for payslips.
        
        This method uses a more advanced approach to preserve:
        1. Table structures and alignments
        2. Section headings and hierarchies
        3. Financial data patterns
        4. Date and time information
        """
        full_document = []
        
        # Process each page
        for page_idx, page in enumerate(extracted_data["pages"]):
            if page_idx > 0:
                # Clear page separator
                full_document.append("\n\n" + "=" * 50)
                full_document.append(f"PAGE {page_idx + 1}")
                full_document.append("=" * 50 + "\n")
            
            # Extract all words with their positions for better spatial analysis
            words_with_positions = self._extract_all_words_with_positions(page)
            
            # Group words into lines based on vertical position
            lines = self._group_words_into_lines(words_with_positions)
            
            # Detect section headings and mark them
            lines = self._detect_and_mark_sections(lines)
            
            # Process and format tabular data
            tables = self._detect_and_format_tables(page, lines)
            
            # Apply formatting and create final text
            formatted_text = self._apply_final_formatting(lines, tables)
            full_document.append(formatted_text)
        
        result = "\n".join(full_document)
        
        # Apply post-processing for financial data, dates, and common payslip patterns
        result = self._post_process_payslip_data(result)
        
        return result
    
    def _extract_all_words_with_positions(self, page: Dict) -> List[Dict]:
        """Extract all words with their positions for spatial analysis."""
        words = []
        
        for block_idx, block in enumerate(page["blocks"]):
            for line_idx, line in enumerate(block["lines"]):
                for word_idx, word in enumerate(line["words"]):
                    # Get word geometry
                    geometry = word.get("geometry", None)
                    if geometry and len(geometry) >= 2:
                        x1, y1 = geometry[0]
                        x2, y2 = geometry[1]
                        
                        words.append({
                            "text": word["value"],
                            "x1": x1, 
                            "y1": y1,
                            "x2": x2, 
                            "y2": y2,
                            "block_idx": block_idx,
                            "line_idx": line_idx,
                            "word_idx": word_idx,
                            "center_x": (x1 + x2) / 2,
                            "center_y": (y1 + y2) / 2,
                            "width": x2 - x1,
                            "height": y2 - y1
                        })
        
        return words
    
    def _group_words_into_lines(self, words: List[Dict]) -> List[Dict]:
        """Group words into lines based on their vertical positions."""
        if not words:
            return []
        
        # Sort words by vertical position (top to bottom)
        sorted_words = sorted(words, key=lambda w: w["center_y"])
        
        # Group words by lines using adaptive thresholding
        y_threshold = 0.01  # Start with a small threshold
        
        # Calculate average word height to use as baseline for threshold
        avg_height = sum(word["height"] for word in words) / len(words)
        y_threshold = max(y_threshold, avg_height * 0.7)  # Adjust threshold based on font size
        
        lines = []
        current_line = [sorted_words[0]]
        current_y = sorted_words[0]["center_y"]
        
        for word in sorted_words[1:]:
            # If this word is on the same line (within threshold)
            if abs(word["center_y"] - current_y) <= y_threshold:
                current_line.append(word)
            else:
                # Sort words in the current line by horizontal position
                current_line.sort(key=lambda w: w["x1"])
                
                # Store current line and start a new one
                lines.append({
                    "words": current_line,
                    "y": current_y,
                    "text": " ".join(w["text"] for w in current_line)
                })
                
                # Start a new line
                current_line = [word]
                current_y = word["center_y"]
        
        # Add the last line
        if current_line:
            current_line.sort(key=lambda w: w["x1"])
            lines.append({
                "words": current_line,
                "y": current_y,
                "text": " ".join(w["text"] for w in current_line)
            })
        
        return lines
    
    def _detect_and_mark_sections(self, lines: List[Dict]) -> List[Dict]:
        """Detect and mark section headings for better structure."""
        section_patterns = [
            # Common patterns for section headings in Danish payslips
            r"(lønoplysninger|lønseddel|specifikation|ferieregnskab|arbejdstidsopgørelse|optælling af timer|metadata|pension|overenskomst|ferie|afspadsering)",
            r"(løn|indtægt|fradrag|a-skat|am-bidrag|arbejdsmarkedsbidrag|skat|pension)",
            r"(timer|normtimer|arbejdstimer|netto\s+udbetalt|brutto)",
            r"^(periode|periode:|beløb|samlet|total)",
            r"^(grundløn|særydelser|tillæg)"
        ]
        
        # Compile patterns for performance
        compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in section_patterns]
        
        for line in lines:
            text = line["text"].lower()
            is_heading = False
            
            # Check if line matches a section pattern
            for pattern in compiled_patterns:
                if pattern.search(text):
                    is_heading = True
                    break
            
            # Check if the line contains any all-caps words (typical for headings)
            if any(word.isupper() and len(word) > 2 for word in line["text"].split()):
                is_heading = True
            
            # Detect lines that have numbers at the beginning or end (likely column headers)
            if re.match(r'^\d+\.?\s+\w+', line["text"]) or re.match(r'^\w+\s+\d+\.?$', line["text"]):
                is_heading = True
            
            # Mark line as heading
            line["is_heading"] = is_heading
        
        return lines
    
    def _detect_and_format_tables(self, page: Dict, lines: List[Dict]) -> List[Dict]:
        """Detect and format tabular structures."""
        tables = []
        
        # Detect potential table rows by checking for consistent vertical spacing
        potential_table_rows = []
        table_candidates = []
        
        for i in range(1, len(lines)):
            # Skip if previous or current line is a heading
            if lines[i].get("is_heading") or lines[i-1].get("is_heading"):
                if potential_table_rows:
                    table_candidates.append(potential_table_rows)
                    potential_table_rows = []
                continue
            
            # Check if this line and the previous line have similar structures
            prev_words = lines[i-1]["words"]
            curr_words = lines[i]["words"]
            
            # Compare number of words and horizontal alignment
            if len(prev_words) > 2 and abs(len(prev_words) - len(curr_words)) <= 1:
                # Compare alignment of words
                alignment_score = self._calculate_column_alignment(prev_words, curr_words)
                
                # If alignment is good, consider as part of the same table
                if alignment_score > 0.6:  # Threshold for considering as aligned
                    if not potential_table_rows:
                        potential_table_rows.append(lines[i-1])
                    potential_table_rows.append(lines[i])
            else:
                # End of potential table
                if potential_table_rows:
                    table_candidates.append(potential_table_rows)
                    potential_table_rows = []
        
        # Add last table if exists
        if potential_table_rows:
            table_candidates.append(potential_table_rows)
        
        # Process each detected table
        for table_rows in table_candidates:
            if len(table_rows) >= 2:  # At least 2 rows to be considered a table
                table = self._format_table(table_rows)
                tables.append(table)
                
                # Mark lines that are part of tables
                for row in table_rows:
                    row["in_table"] = True
        
        return tables
    
    def _calculate_column_alignment(self, row1_words: List[Dict], row2_words: List[Dict]) -> float:
        """Calculate alignment score between two rows to detect tables."""
        if not row1_words or not row2_words:
            return 0.0
        
        # Create position markers for each row
        r1_positions = [w["center_x"] for w in row1_words]
        r2_positions = [w["center_x"] for w in row2_words]
        
        # Count how many positions have close matches
        aligned_count = 0
        threshold = 0.03  # Position match threshold (relative to page width)
        
        for pos1 in r1_positions:
            for pos2 in r2_positions:
                if abs(pos1 - pos2) < threshold:
                    aligned_count += 1
                    break
        
        # Calculate alignment score
        max_possible = min(len(r1_positions), len(r2_positions))
        return aligned_count / max_possible if max_possible > 0 else 0
    
    def _format_table(self, table_rows: List[Dict]) -> Dict:
        """Format detected table for better readability."""
        # Identify columns by clustering x-positions
        all_x_positions = []
        for row in table_rows:
            for word in row["words"]:
                all_x_positions.append(word["center_x"])
        
        # Use simple clustering to identify columns
        x_positions = sorted(all_x_positions)
        columns = []
        if x_positions:
            current_cluster = [x_positions[0]]
            cluster_threshold = 0.03  # Maximum distance to be in the same column
            
            for x in x_positions[1:]:
                if x - current_cluster[-1] < cluster_threshold:
                    current_cluster.append(x)
                else:
                    # End of cluster
                    column_pos = sum(current_cluster) / len(current_cluster)
                    columns.append(column_pos)
                    current_cluster = [x]
            
            # Add last cluster
            if current_cluster:
                column_pos = sum(current_cluster) / len(current_cluster)
                columns.append(column_pos)
        
        # Format each row of the table
        formatted_rows = []
        for row in table_rows:
            column_values = [""] * len(columns)
            
            # Assign words to columns
            for word in row["words"]:
                # Find closest column
                closest_col = min(range(len(columns)), 
                                 key=lambda i: abs(word["center_x"] - columns[i]))
                
                # Add word to that column
                if column_values[closest_col]:
                    column_values[closest_col] += " " + word["text"]
                else:
                    column_values[closest_col] = word["text"]
            
            formatted_rows.append(column_values)
        
        return {
            "rows": formatted_rows,
            "columns": columns,
            "formatted_text": self._render_table(formatted_rows)
        }
    
    def _render_table(self, rows: List[List[str]]) -> str:
        """Render a table with proper column alignment."""
        if not rows:
            return ""
        
        # Calculate column widths
        col_widths = [0] * len(rows[0])
        for row in rows:
            for i, cell in enumerate(row):
                col_widths[i] = max(col_widths[i], len(cell))
        
        # Render rows
        table_lines = []
        for row in rows:
            cells = []
            for i, cell in enumerate(row):
                cells.append(cell.ljust(col_widths[i]))
            table_lines.append("  ".join(cells))
        
        return "\n".join(table_lines)
    
    def _apply_final_formatting(self, lines: List[Dict], tables: List[Dict]) -> str:
        """Apply final formatting to create the document text."""
        result_lines = []
        
        # Track which lines are part of tables to avoid duplication
        table_lines = set()
        for table in tables:
            table_text = table["formatted_text"]
            result_lines.append("\n" + table_text + "\n")
            
            # Mark table rows as processed
            for row in table.get("rows", []):
                table_lines.add(id(row))
        
        # Process non-table lines
        for line in lines:
            # Skip lines that are part of tables (already processed)
            if line.get("in_table"):
                continue
            
            text = line["text"]
            
            # Format headings
            if line.get("is_heading"):
                # Detect if this is a major heading (all caps, short, etc.)
                is_major = text.isupper() or len(text) < 30
                
                if is_major:
                    result_lines.append("\n## " + text.upper() + " ##\n")
                else:
                    result_lines.append("\n# " + text + "\n")
            else:
                # Regular line
                result_lines.append(text)
        
        return "\n".join(result_lines)
    
    def _post_process_payslip_data(self, text: str) -> str:
        """Apply post-processing specifically for payslip data."""
        # Function to enhance numbers and currencies
        def format_numbers(match):
            num = match.group(0)
            # Ensure proper formatting of decimal numbers
            return num.replace(" ", "").replace(",", ".")
        
        # Format common patterns in Danish payslips
        processed = text
        
        # Format currency values and percentages
        money_pattern = r'\b\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?\s*(?:kr\.?|DKK)?\b'
        processed = re.sub(money_pattern, format_numbers, processed)
        
        # Format percentages
        pct_pattern = r'\b\d{1,2}(?:,\d{1,2})?\s*%'
        processed = re.sub(pct_pattern, format_numbers, processed)
        
        # Format dates (Danish format: dd.mm.yyyy or dd-mm-yyyy)
        date_pattern = r'\b\d{1,2}[.-]\d{1,2}[.-]\d{2,4}\b'
        processed = re.sub(date_pattern, lambda m: m.group(0).replace(" ", ""), processed)
        
        # Format CPR numbers (Danish social security numbers)
        cpr_pattern = r'\b\d{6}[-\s]?\d{4}\b'
        processed = re.sub(cpr_pattern, lambda m: m.group(0).replace(" ", "-"), processed)
        
        # Format time intervals (e.g., 08:00-16:00)
        time_pattern = r'\b\d{1,2}[:\.]\d{2}\s*[-–]\s*\d{1,2}[:\.]\d{2}\b'
        processed = re.sub(time_pattern, lambda m: m.group(0).replace(" ", "").replace(".", ":"), processed)
        
        # Replace multiple spaces with a single space and clean up empty lines
        processed = re.sub(r' {2,}', ' ', processed)
        processed = re.sub(r'\n{3,}', '\n\n', processed)
        
        # Add section markers for common payslip sections to help the parser
        sections = {
            r'(?i)(?:^|\n)(?:løn|period|name|cpr)': '\n### METADATA ###\n',
            r'(?i)(?:^|\n)(?:grundløn|fast løn|tillæg)': '\n### LØN ###\n',
            r'(?i)(?:^|\n)(?:ferie|feriepenge|ferietillæg)': '\n### FERIE ###\n',
            r'(?i)(?:^|\n)(?:arbejdstid|timer|optælling)': '\n### TIMER ###\n',
            r'(?i)(?:^|\n)(?:pension|samlet pensionsbidrag)': '\n### PENSION ###\n',
            r'(?i)(?:^|\n)(?:skat|trækprocent|a-skat)': '\n### SKAT ###\n',
            r'(?i)(?:^|\n)(?:arbejdsmarkedsbidrag|am-bidrag)': '\n### AM-BIDRAG ###\n',
        }
        
        for pattern, marker in sections.items():
            processed = re.sub(pattern, lambda m: marker + m.group(0), processed, count=1)
        
        return processed