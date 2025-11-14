//
//  SafariExtensionHandler.swift
//  CALCLiK Safari Extension
//
//  Created by CALCLiK Team on 11/10/25.
//

import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
    
    override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String : Any]?) {
        // Handle messages from the extension JavaScript
        
        print("Received message: \\(messageName)")
        
        switch messageName {
        case "getSettings":
            handleGetSettings(page: page)
            
        case "saveSettings":
            if let settings = userInfo {
                handleSaveSettings(settings: settings, page: page)
            }
            
        case "trackAnalytics":
            if let eventData = userInfo {
                handleAnalyticsTracking(eventData: eventData)
            }
            
        default:
            print("Unknown message: \\(messageName)")
        }
    }
    
    private func handleGetSettings(page: SFSafariPage) {
        // Load settings from UserDefaults
        let defaults = UserDefaults.standard
        
        let settings: [String: Any] = [
            "analyticsEnabled": defaults.bool(forKey: "CALCLiK.analytics.enabled"),
            "aiModel": defaults.string(forKey: "CALCLiK.ai.model") ?? "transformers-js",
            "privacyMode": defaults.bool(forKey: "CALCLiK.privacy.mode"),
            "autoScan": defaults.bool(forKey: "CALCLiK.auto.scan")
        ]
        
        page.dispatchMessageToScript(withName: "settingsResponse", userInfo: settings)
    }
    
    private func handleSaveSettings(settings: [String: Any], page: SFSafariPage) {
        let defaults = UserDefaults.standard
        
        // Save settings to UserDefaults
        if let analyticsEnabled = settings["analyticsEnabled"] as? Bool {
            defaults.set(analyticsEnabled, forKey: "CALCLiK.analytics.enabled")
        }
        
        if let aiModel = settings["aiModel"] as? String {
            defaults.set(aiModel, forKey: "CALCLiK.ai.model")
        }
        
        if let privacyMode = settings["privacyMode"] as? Bool {
            defaults.set(privacyMode, forKey: "CALCLiK.privacy.mode")
        }
        
        if let autoScan = settings["autoScan"] as? Bool {
            defaults.set(autoScan, forKey: "CALCLiK.auto.scan")
        }
        
        // Confirm save
        page.dispatchMessageToScript(withName: "settingsSaved", userInfo: ["success": true])
    }
    
    private func handleAnalyticsTracking(eventData: [String: Any]) {
        // Handle analytics events (privacy-first)
        guard let eventName = eventData["event"] as? String else { return }
        
        print("Analytics event: \\(eventName)")
        
        // Only log non-personal data
        let timestamp = Date().timeIntervalSince1970
        let anonymousData: [String: Any] = [
            "event": eventName,
            "timestamp": timestamp,
            "version": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
            "platform": "safari-macos"
        ]
        
        // Store locally for privacy
        var events = UserDefaults.standard.array(forKey: "CALCLiK.analytics.events") as? [[String: Any]] ?? []
        events.append(anonymousData)
        
        // Keep only last 100 events
        if events.count > 100 {
            events = Array(events.suffix(100))
        }
        
        UserDefaults.standard.set(events, forKey: "CALCLiK.analytics.events")
    }
    
    override func toolbarItemClicked(in window: SFSafariWindow) {
        // This is called when the toolbar item is clicked
        print("CALCLiK toolbar item clicked")
    }
    
    override func validateToolbarItem(in window: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
        // Enable the toolbar item
        validationHandler(true, "")
    }
    
    override func popoverViewController() -> SFSafariExtensionViewController {
        return SafariExtensionViewController.shared
    }
    
    override func popoverWillShow(in window: SFSafariWindow) {
        // Called when the popover is about to be shown
        print("CALCLiK popover will show")
    }
    
    override func popoverDidClose(in window: SFSafariWindow) {
        // Called when the popover is closed
        print("CALCLiK popover closed")
    }
}