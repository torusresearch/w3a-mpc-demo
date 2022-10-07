import type { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import Web3 from "web3";

export default class EthereumRpc {
	private provider: SafeEventEmitterProvider;

	constructor(provider: SafeEventEmitterProvider) {
		this.provider = provider;
	}

	async getChainId(): Promise<string> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get the connected Chain's ID
			const chainId = await web3.eth.getChainId();

			return chainId.toString();
		} catch (error) {
			return error as string;
		}
	}

	async getAccounts(): Promise<any> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const address = (await web3.eth.getAccounts())[0];

			return address;
		} catch (error) {
			return error;
		}
	}

	async getBalance(): Promise<string> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const address = (await web3.eth.getAccounts())[0];

			// Get user's balance in ether
			const balance = web3.utils.fromWei(
				await web3.eth.getBalance(address), // Balance is in wei
			);

			return balance;
		} catch (error) {
			return error as string;
		}
	}

	async signTransaction(): Promise<any> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const fromAddress = (await web3.eth.getAccounts())[0];
			const destination = fromAddress;

			const amount = web3.utils.toWei("0.001"); // Convert 1 ether to wei

			const receipt = await web3.eth.signTransaction({
				from: fromAddress,
				to: destination,
				value: amount,
			});

			return receipt;
		} catch (error) {
			return error as string;
		}
	}

	async sendTransaction(): Promise<any> {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const fromAddress = (await web3.eth.getAccounts())[0];
			const destination = fromAddress;

			const amount = web3.utils.toWei("0.001"); // Convert 1 ether to wei

			// Submit transaction to the blockchain and wait for it to be mined
			const receipt = await web3.eth.sendTransaction({
				from: fromAddress,
				to: destination,
				value: amount,
				chainId: 80001,
			});

			return receipt;
		} catch (error) {
			return error as string;
		}
	}

	async signMessage() {
		try {
			const web3 = new Web3(this.provider as any);

			// Get user's Ethereum public address
			const account = (await web3.eth.getAccounts())[0];

			// Message
			const message = "Hello MPC, bye bye seedphrase";

			const typedMessage = [
				{
					type: "string",
					name: "message",
					value: message,
				},
			];
			const params = [JSON.stringify(typedMessage), account];
			const method = "eth_signTypedData";

			// Sign the message
			// const signedMessage = await web3.eth.personal.sign(
			//   originalMessage,
			//   fromAddress,
			//   'test password!', // configure your own password here.
			// )
			const signedMessage = await this.provider.request({
				method,
				params,
			});

			return signedMessage as string;
		} catch (error) {
			return error as string;
		}
	}

	async getPrivateKey(): Promise<any> {
		try {
			const privateKey = await this.provider.request({
				method: "eth_private_key",
			});

			return privateKey;
		} catch (error) {
			return error as string;
		}
	}

	async getGeneralPrivateKey(): Promise<any> {
		try {
			const privateKey = await this.provider.request({
				method: "private_key",
			});

			return privateKey;
		} catch (error) {
			return error as string;
		}
	}
}
