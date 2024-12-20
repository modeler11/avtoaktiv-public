import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import axios from 'axios';
import API_URL from '../config/api';
import HeaderCodeInjection from '../components/HeaderCodeInjection';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    
    // Получаем код для вставки в header
    let headerCode = '';
    try {
      const response = await axios.get(`${API_URL}/code-injection/public`);
      headerCode = response.data.headerCode || '';
    } catch (error) {
      console.error('Ошибка при загрузке кода для header:', error);
    }

    return { 
      ...initialProps,
      headerCode
    };
  }

  render() {
    const { headerCode } = this.props as any;

    return (
      <Html>
        <Head>
          {/* Базовые мета-теги */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Вставляем код из базы данных как есть */}
          {headerCode && <HeaderCodeInjection code={headerCode} />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 