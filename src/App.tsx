import { useEffect, useState } from "react";
import { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import "./App.css";
import RPC from "./web3RPC"; // for using web3.js
import {tssDataCallback, tssGetPublic, tssSign} from "./mpc";

// MPC stuff
import { OpenloginAdapter } from "@web3auth-mpc/openlogin-adapter";
import { Web3Auth } from "@web3auth-mpc/web3auth";


const clientId = "BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo"; // get from https://dashboard.web3auth.io

function App() {
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
		null,
	);

	useEffect(() => {
		const initEthAuth = async () => {
			try {
				const web3auth = new Web3Auth({
					clientId,
					uiConfig: {
						appLogo: "https://images.web3auth.io/web3auth-logo-w.svg",
						theme: "light",
						loginMethodsOrder: ["twitter", "google"],
					},
					chainConfig: {
						chainNamespace: "eip155",
						chainId: "0x5",
						rpcTarget: "https://rpc.ankr.com/eth_goerli",
						displayName: "Goerli Testnet",
						blockExplorer: "https://goerli.etherscan.io/",
						ticker: "ETH",
						tickerName: "Ethereum",
					},
				});

				const openloginAdapter = new OpenloginAdapter({
					loginSettings: {
						mfaLevel: "mandatory",
					},
					tssSettings: {
						useTSS: true,
						tssGetPublic,
						tssSign,
						tssDataCallback,
					},
					adapterSettings: {
						_iframeUrl: "https://mpc-beta.openlogin.com",
						network: "development",
						clientId,
					},
				});
				(window as any).openloginAdapter = openloginAdapter;

				web3auth.configureAdapter(openloginAdapter);
				// this.subscribeAuthEvents(this.web3auth)
				await web3auth.initModal({
					modalConfig: {
						"torus-evm": {
							label: "Torus Wallet",
							showOnModal: false,
						},
						metamask: {
							label: "Metamask",
							showOnModal: false,
						},
						"wallet-connect-v1": {
							label: "Wallet Connect",
							showOnModal: false,
						},
					},
				});
				setWeb3auth(web3auth);

				if (web3auth.provider) {
					setProvider(web3auth.provider);
				}
			} catch (error) {
				console.log("error", error);
			}
		};
		initEthAuth();
	}, []);

	const login = async () => {
		if (!web3auth) {
			uiConsole("web3auth not initialized yet");
			return;
		}
		console.log("Inside");
		const web3authProvider = await web3auth.connect();
		console.log("After");
		setProvider(web3authProvider);
	};

	const getUserInfo = async () => {
		if (!web3auth) {
			uiConsole("web3auth not initialized yet");
			return;
		}
		const user = await web3auth.getUserInfo();
		uiConsole(user);
	};

	const logout = async () => {
		if (!web3auth) {
			uiConsole("web3auth not initialized yet");
			return;
		}
		await web3auth.logout();
		setProvider(null);
	};

	const getChainId = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const chainId = await rpc.getChainId();
		uiConsole(chainId);
	};
	const getAccounts = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const address = await rpc.getAccounts();
		uiConsole("ETH Address: " + address);
	};

	const getBalance = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const balance = await rpc.getBalance();
		uiConsole(balance);
	};

	const signTransaction = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const receipt = await rpc.signTransaction();
		uiConsole(receipt);
	};

	const sendTransaction = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const receipt = await rpc.sendTransaction();
		uiConsole(receipt);
	};

	const signMessage = async () => {
		if (!provider) {
			uiConsole("provider not initialized yet");
			return;
		}
		const rpc = new RPC(provider);
		const signedMessage = await rpc.signMessage();
		uiConsole(signedMessage);
	};

	function uiConsole(...args: any[]): void {
		const el = document.querySelector("#console>p");
		if (el) {
			el.innerHTML = JSON.stringify(args || {}, null, 2);
		}
	}

	const loggedInView = (
		<>
			<div className="flex-container">
				<div>
					<button onClick={getUserInfo} className="card">
						Get User Info
					</button>
				</div>

				<div>
					<button onClick={getChainId} className="card">
						Get Chain ID
					</button>
				</div>
				<div>
					<button onClick={getAccounts} className="card">
						Get Accounts
					</button>
				</div>
				<div>
					<button onClick={getBalance} className="card">
						Get Balance
					</button>
				</div>
				<div>
					<button onClick={signMessage} className="card">
						Sign Message
					</button>
				</div>
				<div>
					<button onClick={signTransaction} className="card">
						Sign Transaction
					</button>
				</div>
				<div>
					<button onClick={sendTransaction} className="card">
						Send Transaction
					</button>
				</div>
				<div>
					<button onClick={logout} className="card">
						Log Out
					</button>
				</div>
			</div>
			<div id="console" style={{ whiteSpace: "pre-line" }}>
				<p style={{ whiteSpace: "pre-line" }}></p>
			</div>
		</>
	);

	const unloggedInView = (
		<button onClick={login} className="card">
			Login
		</button>
	);

	return (
		<div className="container">
			<h1 className="title">
				<a target="_blank" href="http://web3auth.io/" rel="noreferrer">
					Web3Auth{" "}
				</a>
				MPC & ReactJS Example
			</h1>

			<div className="grid">{provider ? loggedInView : unloggedInView}</div>

			<footer className="footer">
				<a
					href="https://github.com/shahbaz17/w3a-ts-demo"
					target="_blank"
					rel="noopener noreferrer"
				>
					Source code
				</a>
			</footer>
		</div>
	);
}

export default App;
