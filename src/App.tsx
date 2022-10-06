import { useEffect, useState } from "react";
import { SafeEventEmitterProvider } from "@web3auth/base";
import "./App.css";
import RPC from "./web3RPC"; // for using web3.js
//@ts-ignore
import { ec as EC } from "elliptic";

// MPC stuff
import { Client } from "@toruslabs/tss-client";
import * as tss from "@toruslabs/tss-lib";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3Auth } from "@web3auth/web3auth";
import { io, Socket } from "socket.io-client";
import { ecsign, privateToAddress, privateToPublic } from "ethereumjs-util";

// helper libraries
import { safeatob } from "@toruslabs/openlogin-utils";
import { post } from "@toruslabs/http-helpers";
import BN from "bn.js";

const ec = new EC("secp256k1");

const mumbaiTestNetPrivKey = "13ccfbc4b53aef82089575f9b355c63dcdf220b6160bb4dd2d861737cc135ce1";

const tssServerEndpoint =
	"https://load-test-1.k8.authnetwork.dev/tss";
const tssImportURL =
	"https://cloudflare-ipfs.com/ipfs/QmWxSMacBkunyAcKkjuDTU9yCady62n3VGW2gcUEcHg6Vh";

const clientId =
	"BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo"; // get from https://dashboard.web3auth.io

function App() {
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
		null,
	);
	// 	const init = async () => {
	// 		try {
	// 			// ETH_Ropsten
	// 			const web3auth = new Web3Auth({
	// 				clientId,
	// 				chainConfig: {
	// 					chainNamespace: CHAIN_NAMESPACES.EIP155,
	// 					chainId: "0x3",
	// 				},
	// 			});

	// 			setWeb3auth(web3auth);

	// 			await web3auth.initModal();

	// 			// To hide external wallet options
	// await web3auth.initModal({
	//   modalConfig: {
	//     'torus-evm': {
	//       label: 'Torus Wallet',
	//       showOnModal: false,
	//     },
	//     metamask: {
	//       label: 'Metamask',
	//       showOnModal: false,
	//     },
	//     'wallet-connect-v1': {
	//       label: 'Wallet Connect',
	//       showOnModal: false,
	//     },
	//   },
	// })

	// 			// const torusPlugin = new TorusWalletConnectorPlugin({
	// 			//   torusWalletOpts: {
	// 			//     buttonPosition: 'bottom-left',
	// 			//   },
	// 			//   walletInitOptions: {
	// 			//     whiteLabel: {
	// 			//       theme: {isDark: true, colors: {primary: '#00a8ff'}},
	// 			//       logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
	// 			//       logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
	// 			//     },
	// 			//     useWalletConnect: true,
	// 			//     enableLogging: true,
	// 			//   },
	// 			// })

	// 			// torusPlugin.initWithProvider(provider_from_wagmi, userInfo)

	// 			// torusPlugin.initiateTopup('moonpay', {
	// 			//   selectedAddress: 'address',
	// 			//   selectedCurrency: 'USD',
	// 			//   fiatValue: 100,
	// 			//   selectedCryptoCurrency: 'ETH',
	// 			//   chainNetwork: 'mainnet',
	// 			// })

	// 			// await web3auth.addPlugin(torusPlugin)

	// 			if (web3auth.provider) {
	// 				setProvider(web3auth.provider);
	// 			}
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	};
	// 	init();
	// }, []);

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
						chainId: "0x13881",
						rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
						displayName: "Polygon Mainnet",
						blockExplorer: "https://mumbai.polygonscan.com/",
						ticker: "MATIC",
						tickerName: "Matic",
					},
					enableLogging: true,
				});

				let getTSSData: () => Promise<{
					tssShare: string;
					signatures: string[];
				}>;

				const tssGetPublic = async () => {
					return privateToPublic(Buffer.from(mumbaiTestNetPrivKey, "hex"));

					// if (!getTSSData) {
					// 	throw new Error("tssShare / sigs are undefined");
					// }
					// const { tssShare, signatures } = await getTSSData();
					// console.log(tssShare);
					// const pubKey = await getPublicKeyFromTSSShare(tssShare, signatures);
					// console.log("pubKey", Buffer.from(pubKey, "base64").toString("hex"));
					// return Buffer.from(pubKey, "base64");
				};

				const clients: { client: any; allocated: boolean }[] = [];

				const tssSign = async (msgHash: Buffer) => {
					return ecsign(msgHash, Buffer.from(mumbaiTestNetPrivKey, "hex"));

					// generatePrecompute();
					// const finalHash = `0x${msgHash.toString("hex")}`;
					// console.log(finalHash);
					// let foundClient = null;

					// while (!foundClient) {
					// 	for (let i = 0; i < clients.length; i++) {
					// 		const client = clients[i];
					// 		if (!client.allocated) {
					// 			client.allocated = true;
					// 			foundClient = client;
					// 		}
					// 	}
					// 	await new Promise(resolve => setTimeout(resolve, 1000));
					// }
					// await foundClient.client;
					// await tss.default(tssImportURL);
					// const { r, s, recoveryParam } = await foundClient.client.sign(
					// 	tss as any,
					// 	Buffer.from(msgHash).toString("base64"),
					// 	true,
					// 	"",
					// 	"keccak256",
					// );
					// return {
					// 	v: recoveryParam + 27,
					// 	r: Buffer.from(r.toString("hex"), "hex"),
					// 	s: Buffer.from(s.toString("hex"), "hex"),
					// };
				};

				const generatePrecompute = async () => {
					return;
					// if (!getTSSData) {
					// 	throw new Error("tssShare and signatures are not defined");
					// }
					// // if (!provider) {
					// // 	throw new Error("not initialized");
					// // }
					// const { aggregateVerifier: verifierName, verifierId } =
					// 	await web3auth.getUserInfo();
					// if (!verifierName || !verifierId) {
					// 	throw new Error("not logged in, verifier or verifierId undefined");
					// }

					// console.log("WHAT IS THIS", verifierName, verifierId);
					// const { tssShare } = await getTSSData();
					// console.log("TSS Share: ", tssShare);
					// const pubKey = (await tssGetPublic()).toString("base64");
					// const client = await setupTSS(
					// 	tssShare,
					// 	pubKey,
					// 	verifierName,
					// 	verifierId,
					// );
					// await tss.default(tssImportURL);
					// client.precompute(tss as any);
					// await client.ready();
					// clients.push({ client, allocated: false });
				};

				const openloginAdapter = new OpenloginAdapter({
					loginSettings: {
						mfaLevel: "mandatory",
					},
					// tssSettings: {
					// 	useTSS: true,
					// 	tssGetPublic,
					// 	tssSign,
					// 	tssDataCallback: async tssDataReader => {
					// 		getTSSData = tssDataReader;
					// 	},
					// },
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

	// MPC related functions
	const getPublicKeyFromTSSShare = async (
		tssShare: string,
		signatures: string[],
	): Promise<string> => {
		// check if TSS is available
		if (!tssShare || !Array.isArray(signatures) || signatures.length === 0) {
			throw new Error("tssShare or signatures not available");
		}
		const parsedTSSShare = {
			share: tssShare.split("-")[0].split(":")[1],
			index: tssShare.split("-")[1].split(":")[1],
		};

		const parsedSignatures = signatures.map(s => JSON.parse(s));
		const chosenSignature =
			parsedSignatures[Math.floor(Math.random() * parsedSignatures.length)];
		const { verifier_name: verifierName, verifier_id: verifierId } = JSON.parse(
			safeatob(chosenSignature.data),
		);
		if (!verifierName || !verifierId) {
			throw new Error("verifier_name and verifier_id must be specified");
		}

		const { share_pub_x: sharePubX, share_pub_y: sharePubY } = await post<{
			// eslint-disable-next-line camelcase
			share_pub_x: string;
			// eslint-disable-next-line camelcase
			share_pub_y: string;
		}>(`${tssServerEndpoint}/getOrCreateTSSPub`, {
			verifier_name: verifierName,
			verifier_id: verifierId,
		});

		const getLagrangeCoeff = (partyIndexes: BN[], partyIndex: BN): BN => {
			let upper = new BN(1);
			let lower = new BN(1);
			for (let i = 0; i < partyIndexes.length; i += 1) {
				const otherPartyIndex = partyIndexes[i];
				if (!partyIndex.eq(otherPartyIndex)) {
					upper = upper.mul(otherPartyIndex.neg());
					upper = upper.umod(ec.curve.n);
					let temp = partyIndex.sub(otherPartyIndex);
					temp = temp.umod(ec.curve.n);
					lower = lower.mul(temp).umod(ec.curve.n);
				}
			}

			const delta = upper.mul(lower.invm(ec.curve.n)).umod(ec.curve.n);
			return delta;
		};

		// TODO: extend
		const localIndex = 1;
		const remoteIndex = 0;
		const parties = [0, 1];
		const pubKeyPoint = ec
			.keyFromPublic({ x: sharePubX, y: sharePubY })
			.getPublic()
			.mul(
				getLagrangeCoeff(
					parties.map(p => new BN(p + 1)),
					new BN(remoteIndex + 1),
				),
			)
			.add(
				ec
					.keyFromPrivate(
						Buffer.from(parsedTSSShare.share.padStart(64, "0"), "hex"),
					)
					.getPublic()
					.mul(
						getLagrangeCoeff(
							parties.map(p => new BN(p + 1)),
							new BN(localIndex + 1),
						),
					),
			);
		const pubKeyX = pubKeyPoint.getX().toString(16, 64);
		const pubKeyY = pubKeyPoint.getY().toString(16, 64);
		const pubKeyHex = `${pubKeyX}${pubKeyY}`;
		const pubKey = Buffer.from(pubKeyHex, "hex").toString("base64");

		return pubKey;
	};

	const createSockets = async (
		wsEndpoints: (string | null | undefined)[],
	): Promise<(Socket | null)[]> => {
		const sockets = wsEndpoints.map(wsEndpoint => {
			if (wsEndpoint === null || wsEndpoint === undefined) {
				return null;
			}
			const origin = new URL(wsEndpoint).origin;
			const path = `${new URL(wsEndpoint).pathname}/socket.io/`;
			return io(origin, { path });
		});

		await new Promise(resolve => {
			const timer = setInterval(() => {
				for (let i = 0; i < sockets.length; i++) {
					const socket = sockets[i];
					if (socket === null) continue;
					if (!socket.id) return;
				}
				clearInterval(timer);
				resolve(true);
			}, 500);
		});

		return sockets;
	};

	const setupTSS = async (
		tssShare: string,
		pubKey: string,
		verifierName: string,
		verifierId: string,
	): Promise<any> => {
		const endpoints = [tssServerEndpoint, null];
		const wsEndpoints = [tssServerEndpoint, null];
		const sockets = await createSockets(wsEndpoints);
		const parsedTSSShare = {
			share: tssShare.split("-")[0].split(":")[1],
			index: tssShare.split("-")[1].split(":")[1],
		};

		const base64Share = Buffer.from(
			parsedTSSShare.share.padStart(64, "0"),
			"hex",
		).toString("base64");
		// TODO: extend
		const localIndex = 1;
		const remoteIndex = 0;
		const parties = [0, 1];

		return new Client(
			`${verifierName}~${verifierId}:${Date.now()}`,
			localIndex,
			parties,
			endpoints,
			sockets,
			base64Share,
			pubKey,
			true,
			tssImportURL,
		);
	};

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
		<button disabled={!web3auth} onClick={login} className="card">
			{ web3auth ? "Login" : "Loading..." }
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
