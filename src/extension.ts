// https://code.visualstudio.com/api/get-started/your-first-extension
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cryptoJS from 'crypto-js';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		console.log(document.languageId);
		if (document.languageId === "your-id" && document.uri.scheme === "file") {
			// do work
		}
	});
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "env-secret" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('env-secret.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from env-secret!');
	});

	context.subscriptions.push(disposable);

	const encrypt = vscode.commands.registerCommand('extension.encrypt', async () => {
		const fullText = vscode.window.activeTextEditor?.document.getText(); 
		const passString = await vscode.window.showInputBox({ 
			prompt: 'Provide your passphrase', 
			placeHolder: 'My passphrase',	
			password: true, 
			validateInput: value => (value.length == 0) ? "Passphrase cannot be empty" : null 
		}) ?? '';
		const cipherText = CryptoJS.AES.encrypt(fullText ?? '', passString).toString();
		let wordWrapColumn = vscode.workspace.getConfiguration('editor').get('wordWrapColumn', false) || 80;
		const regex = new RegExp(`.{1,${wordWrapColumn}}`,"g");
		const cipherFormatted = cipherText.match(regex)?.join("\r\n") ?? '';
		const invalidRange = new vscode.Range(0, 0, vscode.window.activeTextEditor?.document.lineCount ?? 0, 0);
		const fullRange = vscode.window.activeTextEditor?.document.validateRange(invalidRange);
		if(!!fullRange){
			vscode.window.activeTextEditor?.edit(edit => edit.replace(fullRange, cipherFormatted));
			vscode.window.showInformationMessage(`File Encrypted`);
		}
		
	});
	context.subscriptions.push(encrypt);

	const decrypt = vscode.commands.registerCommand('extension.decrypt', async () => {
		const fullText = vscode.window.activeTextEditor?.document.getText();
		const cleanText = fullText?.split("\r\n")?.join('') ?? '';
		const passString = await vscode.window.showInputBox({ 
			prompt: 'Provide your passphrase', 
			placeHolder: 'My passphrase',	
			password: true, 
			validateInput: value => (value.length == 0) ? "Passphrase cannot be empty" : null 
		}) ?? '';
		const bytes  = CryptoJS.AES.decrypt(cleanText, passString);
		const plainText = bytes.toString(CryptoJS.enc.Utf8);
		const invalidRange = new vscode.Range(0, 0, vscode.window.activeTextEditor?.document.lineCount ?? 0, 0);
		const fullRange = vscode.window.activeTextEditor?.document.validateRange(invalidRange);
		if(!!fullRange){
			vscode.window.activeTextEditor?.edit(edit => edit.replace(fullRange, plainText));
			vscode.window.showInformationMessage(`File Decrypted`);
		}
	});
	context.subscriptions.push(decrypt);
}

exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {}
module.exports = {
	activate,
	deactivate
}