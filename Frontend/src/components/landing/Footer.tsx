import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/assets/images/logo.svg" alt="PayTjek Logo" className="h-8 w-auto" />
              <span className="font-bold text-lg">PayTjek</span>
            </Link>
            <p className="text-gray-600 mb-4">{t('landing.footer.tagline')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/dashboard" className="hover:text-gray-900">{t('common.dashboard')}</Link></li>
              <li><Link to="/upload" className="hover:text-gray-900">{t('common.upload')}</Link></li>
              <li><Link to="/analysis" className="hover:text-gray-900">{t('common.analysis')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">{t('landing.footer.company')}</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="#" className="hover:text-gray-900">{t('landing.footer.about')}</Link></li>
              <li><Link to="#" className="hover:text-gray-900">{t('landing.footer.privacy')}</Link></li>
              <li><Link to="#" className="hover:text-gray-900">{t('landing.footer.terms')}</Link></li>
              <li><Link to="#" className="hover:text-gray-900">{t('landing.footer.contact')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between text-gray-600 text-sm">
          <p>{t('landing.footer.copyright').replace('PayCheck Insights', 'PayTjek')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-gray-900">{t('landing.footer.privacyPolicy')}</Link>
            <Link to="#" className="hover:text-gray-900">{t('landing.footer.termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
