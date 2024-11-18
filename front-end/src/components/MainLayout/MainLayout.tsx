import { Outlet } from "react-router-dom";
import NavBar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./MainLayout.module.scss";

export default function MainLayout(){

	return (
		<div className={styles.MainLayout}>
			<NavBar/>
			<Outlet/>
			<Footer/>
		</div>
	);
}