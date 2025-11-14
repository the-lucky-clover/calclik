//
//  ViewController.swift
//  CALCLiK Safari
//
//  Created by CALCLiK Team on 11/10/25.
//

import Cocoa
import SafariServices

class ViewController: NSViewController {

    @IBOutlet var appNameLabel: NSTextField!
    @IBOutlet var appDescriptionLabel: NSTextField!
    @IBOutlet var enableExtensionButton: NSButton!
    @IBOutlet var statusLabel: NSTextField!
    @IBOutlet var iconImageView: NSImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        checkExtensionStatus()
    }
    
    private func setupUI() {
        // Set up the main app interface
        appNameLabel.stringValue = "CALCLiK - Smart Event Scanner"
        appDescriptionLabel.stringValue = "AI-powered event extraction from any webpage. Privacy-first with local processing."
        
        // Configure the icon
        if let appIcon = NSImage(named: "AppIcon") {
            iconImageView.image = appIcon
            iconImageView.imageScaling = .scaleProportionallyUpOrDown
        }
        
        // Style the enable button
        enableExtensionButton.title = "Enable CALCLiK Extension"
        enableExtensionButton.controlSize = .large
        
        // Set up status label
        statusLabel.stringValue = "Checking extension status..."
        statusLabel.textColor = .secondaryLabelColor
    }
    
    private func checkExtensionStatus() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: "com.CALCLiK.safari.extension") { (state, error) in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error getting extension state: \\(error)")
                    self.statusLabel.stringValue = "Error checking extension status"
                    self.statusLabel.textColor = .systemRed
                    return
                }
                
                guard let state = state else {
                    self.statusLabel.stringValue = "Extension state unknown"
                    self.statusLabel.textColor = .systemOrange
                    return
                }
                
                if state.isEnabled {
                    self.statusLabel.stringValue = "✅ CALCLiK extension is enabled and ready!"
                    self.statusLabel.textColor = .systemGreen
                    self.enableExtensionButton.title = "Extension Enabled"
                    self.enableExtensionButton.isEnabled = false
                } else {
                    self.statusLabel.stringValue = "⚠️ Extension is installed but not enabled"
                    self.statusLabel.textColor = .systemOrange
                    self.enableExtensionButton.title = "Open Safari Extensions"
                    self.enableExtensionButton.isEnabled = true
                }
            }
        }
    }
    
    @IBAction func enableExtensionButtonTapped(_ sender: Any) {
        // Open Safari Extension preferences
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.CALCLiK.safari.extension") { error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error opening Safari preferences: \\(error)")
                    
                    // Fallback: Open Safari Extensions preferences manually
                    let workspace = NSWorkspace.shared
                    workspace.open(URL(string: "x-safari-extension://extensions/")!)
                } else {
                    // Recheck status after a delay
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                        self.checkExtensionStatus()
                    }
                }
            }
        }
    }
    
    @IBAction func learnMoreButtonTapped(_ sender: Any) {
        // Open CALCLiK website
        if let url = URL(string: "https://CALCLiK.com") {
            NSWorkspace.shared.open(url)
        }
    }
    
    @IBAction func supportButtonTapped(_ sender: Any) {
        // Open support email
        let emailSubject = "CALCLiK Safari Extension Support"
        let emailBody = "Hi CALCLiK team,\\n\\nI need help with the Safari extension.\\n\\nSystem Info:\\n- macOS: \\(ProcessInfo.processInfo.operatingSystemVersionString)\\n- Safari Version: [Please add your Safari version]\\n\\nIssue description:\\n[Please describe your issue]"
        
        if let emailURL = URL(string: "mailto:support@CALCLiK.com?subject=\\(emailSubject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&body=\\(emailBody.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") {
            NSWorkspace.shared.open(emailURL)
        }
    }
}