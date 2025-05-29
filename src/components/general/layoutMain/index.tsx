import { Footer } from './footer';
import AnimatedNavbar from './navbar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AnimatedNavbar />
      {children}
      <Footer />
    </>
  );
};
