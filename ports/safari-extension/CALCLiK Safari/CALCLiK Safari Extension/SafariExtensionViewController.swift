//
//  SafariExtensionViewController.swift
//  CALCLiK Safari Extension
//
//  Created by CALCLiK Team on 11/10/25.
//

import SafariServices

class SafariExtensionViewController: SFSafariExtensionViewController {
    
    static let shared: SafariExtensionViewController = {
        let shared = SafariExtensionViewController()
        return shared
    }()
    
    @IBOutlet weak var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupPopover()
    }
    
    private func setupPopover() {
        // Set the preferred content size for the popover
        self.preferredContentSize = NSSize(width: 380, height: 500)
        
        // Load the popup HTML
        if let htmlPath = Bundle.main.path(forResource: "popup", ofType: "html", inDirectory: "Resources") {
            let htmlURL = URL(fileURLWithPath: htmlPath)
            
            if let webView = webView {
                webView.loadFileURL(htmlURL, allowingReadAccessTo: htmlURL.deletingLastPathComponent())
            } else {
                print("WebView not connected")
            }
        } else {
            print("Could not find popup.html")
        }
    }
}