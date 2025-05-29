'use client';
import { Input } from '@skripsi/components';
import { Button } from '@skripsi/components';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link as LinkScroll } from 'react-scroll';
import Link from 'next/link';
import type { FC } from 'react';

export const Footer: FC = () => {
  const t = useTranslations('layout.footer');
  const dataLink = t.raw('quickLinks');
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              {t('nameCompany')}
            </h2>
            <p className="mb-4">{t('descriptionCompany')}</p>
            <div className="flex space-x-4">
              <Link href="#">
                <Facebook className="hover:text-white" size={20} />
              </Link>
              <Link href="#">
                <Twitter className="hover:text-white" size={20} />
              </Link>
              <Link href="#">
                <Instagram className="hover:text-white" size={20} />
              </Link>
              <Link href="#">
                <Linkedin className="hover:text-white" size={20} />
              </Link>
              <Link href="#">
                <Youtube className="hover:text-white" size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h2>
            <ul className="space-y-2">
              {dataLink.map(
                (item: { name: string; to: string }, index: number) => (
                  <li key={index}>
                    <LinkScroll
                      to={item.to}
                      spy={true}
                      smooth={true}
                      offset={-70} // Adjust this value based on your navbar height
                      duration={500}
                      className="hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      {item.name}
                    </LinkScroll>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              {t('contactUs.title')}
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail size={20} className="mr-2" /> {t('contactUs.email')}
              </li>
              <li>{t('contactUs.address')}</li>
              <li>{t('contactUs.phone')}</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="mb-4">{t('newsletter.desc')}</p>
            <form className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder={t('newsletter.fields.placeholder')}
                className="bg-gray-800 text-white border-gray-700 focus:border-blue-500"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('newsletter.fields.submit')}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} Company Name. All rights reserved.
          </p>
          {/* <div className="mt-4 md:mt-0">
            <Link href="#" className="hover:text-white mr-4">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white mr-4">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white">
              Cookie Policy
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};
