import 'tailwindcss/tailwind.css';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  if (isAdminPage) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp; 