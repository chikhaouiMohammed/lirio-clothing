import Footer from "../components/Footer/Footer"
import Header from "../components/Header/Header"
import ProductsList from "../components/ProductsList/ProductsList"

const Home = () => {
  return <>
    <Header/>
    <ProductsList/>
    <hr  className=" mt-20"/>
    <Footer/>
  </>
}

export default Home