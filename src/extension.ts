import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const webview = vscode.commands.registerCommand('vscode-mui-material-icon-picker.showPicker', () => {

		const panel = vscode.window.createWebviewPanel("webview", "Material Icon Picker for MUI", vscode.ViewColumn.One, {
			enableScripts: true,
			retainContextWhenHidden: true
		});

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.cmd) {
					case 'openExternalBrowser':
						vscode.env.openExternal(vscode.Uri.parse(message.content));
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		// Get assets
		const scriptSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "web", "dist", "main.js"));
		const cssSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "web", "dist", "main.css"));

		panel.webview.html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="${cssSrc}" />
    </head>
    <body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="app"></div>
        <script type="module" src="${scriptSrc}"></script>
    </body>
</html>`;
	});

	context.subscriptions.push(webview);
}

export function deactivate() { }