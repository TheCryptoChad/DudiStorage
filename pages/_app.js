import Fonts from '../components/Fonts'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Fonts />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
