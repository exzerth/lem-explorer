import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<a href="/">
				<img
					className={styles.alchemy_logo}
					src="/brand-log.png"
					height={45}
				></img>
			</a>
			<ConnectButton></ConnectButton>
		</nav>
	);
}
