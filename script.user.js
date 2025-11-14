// ==UserScript==
// @name         Cam ARNA
// @namespace    http://tampermonkey.net/
// @version      1.0 Release
// @description  Modern Dark UI for Stripchat and Chaturbate with Glassmorphism Design, Real Favicons, Export/Import, Low Power Mode and Page Preloading
// @author       user006-ui
// @match        https://*.stripchat.com/*
// @match        https://*.chaturbate.com/*
// @match        https://chaturbate.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // Archive Sites Configuration - without icons (will use favicons)
    const archiveSites = [
        { name: 'Archivebate', url: 'https://archivebate.com/profile/{username}', domain: 'archivebate.com', color: '#ff4757' },
        { name: 'Showcamrips', url: 'https://showcamrips.com/model/en/{username}', domain: 'showcamrips.com', color: '#3742fa' },
        { name: 'Camshowrecordings', url: 'https://www.camshowrecordings.com/model/{username}', domain: 'camshowrecordings.com', color: '#a29bfe' },
        { name: 'Camwh', url: 'https://camwh.com/tags/{username}/', domain: 'camwh.com', color: '#ffa502' },
        { name: 'TopCamVideos', url: 'https://www.topcamvideos.com/showall/?search={username}', domain: 'topcamvideos.com', color: '#ff6348' },
        { name: 'LoveCamPorn', url: 'https://lovecamporn.com/showall/?search={username}', domain: 'lovecamporn.com', color: '#fd79a8' },
        { name: 'Camwhores.tv', url: 'https://www.camwhores.tv/search/{username}/', domain: 'camwhores.tv', color: '#6c5ce7' },
        { name: 'Bestcam.tv', url: 'https://bestcam.tv/model/{username}', domain: 'bestcam.tv', color: '#00b894' },
        { name: 'Xhomealone', url: 'https://xhomealone.com/tags/{username}/', domain: 'xhomealone.com', color: '#fdcb6e' },
        { name: 'Stream-leak', url: 'https://stream-leak.com/models/{username}/', domain: 'stream-leak.com', color: '#e17055' },
        { name: 'MFCamhub', url: 'https://mfcamhub.com/models/{username}/', domain: 'mfcamhub.com', color: '#00cec9' },
        { name: 'Camshowrecord', url: 'https://camshowrecord.net/video/list?page=1&model={username}', domain: 'camshowrecord.net', color: '#fab1a0' },
        { name: 'Camwhoresbay', url: 'https://www.camwhoresbay.com/search/{username}/', domain: 'camwhoresbay.com', color: '#74b9ff' },
        { name: 'CamSave1', url: 'https://www.camsave1.com/?feet=0&face=0&ass=0&tits=0&pussy=0&search={username}&women=true&couples=true&men=false&trans=false', domain: 'camsave1.com', color: '#55a3ff' },
        { name: 'Onscreens', url: 'https://www.onscreens.me/m/{username}', domain: 'onscreens.me', color: '#48dbfb' },
        { name: 'Livecamrips', url: 'https://livecamrips.to/search/{username}/1', domain: 'livecamrips.to', color: '#0abde3' },
        { name: 'Cumcams', url: 'https://cumcams.cc/performer/{username}', domain: 'cumcams.cc', color: '#ff69b4' }
    ];

    // Main Sites URLs
    const mainSites = {
        'stripchat': 'https://stripchat.com/{username}',
        'chaturbate': 'https://chaturbate.com/{username}/'
    };

    // Helper function to get favicon URL
    function getFaviconUrl(domain) {
        // Using Google's favicon service as primary, with DuckDuckGo as fallback
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    }

    // Page availability checker
    const PageChecker = {
        cache: {},

        checkPage: function(url) {
            return new Promise((resolve) => {
                // Check cache first
                if (this.cache.hasOwnProperty(url)) {
                    resolve(this.cache[url]);
                    return;
                }

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: 10000,
                    onload: (response) => {
                        const exists = this.analyzeResponse(response);
                        this.cache[url] = exists;
                        resolve(exists);
                    },
                    onerror: () => {
                        this.cache[url] = false;
                        resolve(false);
                    },
                    ontimeout: () => {
                        this.cache[url] = false;
                        resolve(false);
                    }
                });
            });
        },

        analyzeResponse: function(response) {
            // Check status code
            if (response.status === 404 || response.status >= 500) {
                return false;
            }

            // Check response text for 404 indicators
            const text = response.responseText.toLowerCase();
            const title = text.match(/<title[^>]*>(.*?)<\/title>/i);

            if (title && title[1]) {
                const titleText = title[1].toLowerCase();

                // Check for common 404 patterns in title
                const notFoundPatterns = [
                    'not found',
                    '404',
                    'page not found',
                    'not found',
                    'no results',
                    'user not found',
                    'model not found',
                    'profile not found'
                ];

                for (const pattern of notFoundPatterns) {
                    if (titleText.includes(pattern)) {
                        return false;
                    }
                }
            }

            // Check body content for 404 indicators
            const bodyPatterns = [
                'no videos found',
                'no results found',
                'model does not exist',
                'user does not exist',
                'profile does not exist'
            ];

            for (const pattern of bodyPatterns) {
                if (text.includes(pattern)) {
                    return false;
                }
            }

            return true;
        },

        clearCache: function() {
            this.cache = {};
        }
    };

    // Inject Modern Styles
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            * {
                box-sizing: border-box;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translate(-50%, -50%) translateX(100px); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            @keyframes glow {
                0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
                50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(99, 102, 241, 0.4); }
                100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
            }

            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            @keyframes neonPulse {
                0%, 100% {
                    text-shadow:
                        0 0 4px #fff,
                        0 0 11px #fff,
                        0 0 19px #fff,
                        0 0 40px #6366f1,
                        0 0 80px #6366f1,
                        0 0 90px #6366f1,
                        0 0 100px #6366f1,
                        0 0 150px #6366f1;
                }
                50% {
                    text-shadow:
                        0 0 4px #fff,
                        0 0 11px #fff,
                        0 0 19px #fff,
                        0 0 40px #818cf8,
                        0 0 80px #818cf8,
                        0 0 90px #818cf8,
                        0 0 100px #818cf8,
                        0 0 150px #818cf8;
                }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .cam-menu-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(5px);
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .cam-menu-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-width: 90vw;
            }

            .cam-menu {
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
                backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                box-shadow:
                    0 20px 25px -5px rgba(0, 0, 0, 0.3),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
                width: 480px;
                max-height: 85vh;
                overflow: hidden;
                position: relative;
            }

            .cam-menu::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 200px;
                background: linear-gradient(to bottom, rgba(99, 102, 241, 0.1), transparent);
                pointer-events: none;
            }

            .cam-menu-header {
                padding: 24px;
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                position: relative;
                z-index: 1;
            }

            .cam-menu-title {
                color: #ffffff;
                font-size: 22px;
                font-weight: 700;
                margin: 0 0 4px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .cam-menu-subtitle {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                font-weight: 400;
            }

            .cam-close-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #ffffff;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }

            .cam-close-btn:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.3);
                transform: rotate(90deg);
            }

            .cam-input-wrapper {
                padding: 20px 24px;
                background: rgba(0, 0, 0, 0.1);
            }

            .cam-input-group {
                position: relative;
            }

            .cam-input-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 18px;
                z-index: 1;
            }

            .cam-input {
                width: 100%;
                padding: 14px 16px 14px 50px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #ffffff;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
            }

            .cam-input:focus {
                outline: none;
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(99, 102, 241, 0.5);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }

            .cam-input::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }

            .cam-tabs {
                display: flex;
                gap: 8px;
                padding: 16px 24px;
                background: rgba(0, 0, 0, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .cam-tab {
                flex: 1;
                padding: 10px 16px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .cam-tab:hover {
                background: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.8);
            }

            .cam-tab.active {
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
                border-color: rgba(99, 102, 241, 0.3);
                color: #ffffff;
            }

            .cam-content {
                padding: 20px 24px;
                max-height: calc(85vh - 300px);
                overflow-y: auto;
            }

            .cam-content::-webkit-scrollbar {
                width: 8px;
            }

            .cam-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            .cam-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }

            .cam-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .cam-section {
                margin-bottom: 24px;
            }

            .cam-section-title {
                color: #ffffff;
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cam-section-icon {
                font-size: 18px;
            }

            .cam-main-sites {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .cam-main-btn {
                padding: 16px;
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: 12px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                position: relative;
                overflow: hidden;
            }

            .cam-main-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s;
            }

            .cam-main-btn:hover::before {
                left: 100%;
            }

            .cam-main-btn:hover {
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
                border-color: rgba(99, 102, 241, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
            }

            .cam-main-btn-icon {
                font-size: 20px;
            }

            .cam-stealth-btn {
                width: 100%;
                margin-top: 12px;
                padding: 14px;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.15));
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .cam-stealth-btn:hover {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(167, 139, 250, 0.25));
                border-color: rgba(139, 92, 246, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
            }

            .cam-archives-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .cam-archive-btn {
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #ffffff;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
                overflow: hidden;
            }

            .cam-archive-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, var(--btn-color, #6366f1), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .cam-archive-btn:hover::before {
                opacity: 0.15;
            }

            .cam-archive-btn:hover {
                border-color: var(--btn-color, rgba(99, 102, 241, 0.3));
                transform: translateX(4px);
            }

            .cam-archive-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                flex-shrink: 0;
            }

            .cam-archive-icon img {
                width: 16px;
                height: 16px;
                object-fit: contain;
            }

            .cam-archive-icon.fallback {
                font-size: 14px;
            }

            /* Loading state for buttons */
            .cam-archive-btn.checking {
                pointer-events: none;
                opacity: 0.6;
            }

            .cam-archive-btn.checking::after {
                content: '';
                position: absolute;
                top: 50%;
                right: 12px;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: #ffffff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            /* Disabled/unavailable state */
            .cam-archive-btn.unavailable {
                opacity: 0.35;
                cursor: not-allowed;
                pointer-events: none;
                filter: grayscale(1);
                background: rgba(255, 255, 255, 0.02);
            }

            .cam-archive-btn.unavailable::before {
                display: none;
            }

            .cam-archive-btn.unavailable::after {
                content: '✗';
                position: absolute;
                top: 8px;
                right: 8px;
                width: 18px;
                height: 18px;
                background: rgba(239, 68, 68, 0.2);
                border-radius: 50%;
                color: #ef4444;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            /* Available state */
            .cam-archive-btn.available::after {
                content: '✓';
                position: absolute;
                top: 8px;
                right: 8px;
                width: 18px;
                height: 18px;
                background: rgba(34, 197, 94, 0.2);
                border-radius: 50%;
                color: #22c55e;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .cam-save-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(74, 222, 128, 0.15));
                border: 2px solid rgba(34, 197, 94, 0.3);
                border-radius: 12px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 16px;
            }

            .cam-save-btn:hover {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(74, 222, 128, 0.25));
                border-color: rgba(34, 197, 94, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
            }

            .cam-pulse {
                animation: pulse 2s ease-in-out infinite;
            }

            .cam-glow {
                animation: glow 2s ease-in-out infinite;
            }

            .cam-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 14px 24px;
                background: rgba(17, 24, 39, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 500;
                z-index: 10001;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
                font-family: 'Inter', sans-serif;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }

            .cam-toast.success {
                border-color: rgba(34, 197, 94, 0.3);
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(34, 197, 94, 0.1));
            }

            .cam-toast.error {
                border-color: rgba(239, 68, 68, 0.3);
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(239, 68, 68, 0.1));
            }

            .cam-toast.info {
                border-color: rgba(59, 130, 246, 0.3);
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(59, 130, 246, 0.1));
            }

            /* Saved Profilees Styles */
            .cam-saved-empty {
                text-align: center;
                padding: 60px 20px;
                color: rgba(255, 255, 255, 0.5);
                font-size: 14px;
            }

            .cam-saved-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }

            .cam-saved-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .cam-saved-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                transition: all 0.3s ease;
            }

            .cam-saved-item:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(99, 102, 241, 0.3);
            }

            .cam-saved-name {
                color: #ffffff;
                font-weight: 600;
                font-size: 14px;
            }

            .cam-saved-actions {
                display: flex;
                gap: 6px;
            }

            .cam-saved-action {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #ffffff;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .cam-saved-action:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-1px);
            }

            .cam-saved-action.delete {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.2);
            }

            .cam-saved-action.delete:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.3);
            }

            /* Settings Styles */
            .cam-settings-section {
                margin-bottom: 24px;
            }

            .cam-settings-header {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #ffffff;
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 12px;
            }

            .cam-settings-icon {
                font-size: 18px;
            }

            .cam-settings-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .cam-settings-btn {
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .cam-settings-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(99, 102, 241, 0.3);
                transform: translateY(-1px);
            }

            .cam-toggle-wrapper {
                display: block;
                padding: 12px;
                padding-right: 70px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 10px;
                position: relative;
                cursor: pointer;
                min-height: 70px;
            }

            .cam-toggle-label {
                color: #ffffff;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                display: block;
            }

            .cam-toggle-description {
                color: rgba(255, 255, 255, 0.5);
                font-size: 12px;
                line-height: 1.4;
                display: block;
                max-width: calc(100% - 60px);
            }

            .cam-toggle-input {
                display: none;
            }

            .cam-toggle-slider {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 48px;
                height: 26px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 34px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cam-toggle-slider::before {
                content: '';
                position: absolute;
                width: 20px;
                height: 20px;
                left: 3px;
                top: 2px;
                background: #ffffff;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .cam-toggle-input:checked + .cam-toggle-slider {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                border-color: transparent;
            }

            .cam-toggle-input:checked + .cam-toggle-slider::before {
                transform: translateX(22px);
                background: #ffffff;
            }

            .cam-settings-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 13px;
            }

            .cam-settings-info span {
                color: #ffffff;
                font-weight: 600;
            }

            /* Low Power Mode Styles */
            body.low-power-mode * {
                animation: none !important;
                transition: none !important;
                backdrop-filter: none !important;
                filter: none !important;
                box-shadow: none !important;
            }

            /* Preserve essential transforms for positioning */
            body.low-power-mode .cam-menu-container {
                transform: translate(-50%, -50%) !important;
            }

            body.low-power-mode .cam-archive-btn:hover,
            body.low-power-mode .cam-main-btn:hover,
            body.low-power-mode .cam-stealth-btn:hover,
            body.low-power-mode .cam-save-btn:hover,
            body.low-power-mode .cam-settings-btn:hover,
            body.low-power-mode .cam-saved-action:hover,
            body.low-power-mode #floating-cam-btn:hover {
                transform: none !important;
            }

            body.low-power-mode .cam-menu-backdrop {
                background: rgba(0, 0, 0, 0.5);
            }

            body.low-power-mode .cam-menu {
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
            }

            body.low-power-mode .cam-menu-header {
                background: #222;
                border-bottom: 1px solid #333;
            }

            body.low-power-mode .cam-input {
                background: #2a2a2a;
                border: 1px solid #444;
            }

            body.low-power-mode .cam-archive-btn,
            body.low-power-mode .cam-main-btn,
            body.low-power-mode .cam-stealth-btn,
            body.low-power-mode .cam-save-btn {
                background: #2a2a2a;
                border: 1px solid #444;
            }

            body.low-power-mode .cam-archive-btn:hover,
            body.low-power-mode .cam-main-btn:hover,
            body.low-power-mode .cam-stealth-btn:hover,
            body.low-power-mode .cam-save-btn:hover {
                background: #333;
            }

            body.low-power-mode .cam-menu::before,
            body.low-power-mode .cam-archive-btn::before,
            body.low-power-mode .cam-main-btn::before,
            body.low-power-mode .cam-save-btn::before {
                display: none;
            }

            body.low-power-mode .cam-pulse,
            body.low-power-mode .cam-glow {
                animation: none;
            }

            body.low-power-mode #floating-cam-btn {
                background: #6366f1 !important;
                animation: none !important;
            }

            /* Preserve unavailable state in low power mode */
            body.low-power-mode .cam-archive-btn.unavailable {
                opacity: 0.35 !important;
                filter: grayscale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Storage Management
    const Storage = {
        get: (key, defaultValue = []) => {
            try {
                return JSON.parse(localStorage.getItem(key)) || defaultValue;
            } catch (e) {
                console.error('Storage read error:', e);
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage write error:', e);
                return false;
            }
        }
    };

    // Profilee Management
    const ProfileeManager = {
        STORAGE_KEY: 'cam-saved-profiles',

        getProfilees: function() {
            return Storage.get(this.STORAGE_KEY, []);
        },

        saveProfilee: function(username) {
            const profiles = this.getProfilees();
            if (!profiles.includes(username)) {
                profiles.push(username);
                return Storage.set(this.STORAGE_KEY, profiles);
            }
            return false;
        },

        removeProfilee: function(username) {
            const profiles = this.getProfilees();
            const filtered = profiles.filter(p => p !== username);
            return Storage.set(this.STORAGE_KEY, filtered);
        }
    };

    // UI Management
    const UI = {
        createMenu: function() {
            // Remove existing menu if any
            const existing = document.querySelector('.cam-menu-container');
            if (existing) {
                existing.remove();
                document.querySelector('.cam-menu-backdrop')?.remove();
                return;
            }

            // Create backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'cam-menu-backdrop';

            // Create container
            const container = document.createElement('div');
            container.className = 'cam-menu-container';

            // Create menu
            const menu = document.createElement('div');
            menu.className = 'cam-menu';

            // Detect current site
            const hostname = window.location.hostname;
            const currentSite = hostname.includes('chaturbate.com') ? 'chaturbate' : 'stripchat';
            const currentUsername = this.extractUsername(currentSite);

            // Header
            menu.innerHTML = `
                <div class="cam-menu-header">
                    <div class="cam-menu-title">
                        <span style="font-size: 28px;">🌟</span>
                        Archive Explorer
                    </div>
                    <div class="cam-menu-subtitle">${currentSite === 'chaturbate' ? 'Chaturbate' : 'Stripchat'} Edition</div>
                    <button class="cam-close-btn">✕</button>
                </div>

                <div class="cam-input-wrapper">
                    <div class="cam-input-group">
                        <span class="cam-input-icon">👤</span>
                        <input type="text" class="cam-input" id="username-input"
                               placeholder="Enter username..." value="${currentUsername || ''}">
                    </div>
                </div>

                <div class="cam-tabs">
                    <button class="cam-tab active" data-tab="search">🔍 Search</button>
                    <button class="cam-tab" data-tab="saved">⭐ Saved</button>
                    <button class="cam-tab" data-tab="settings">⚙️ Settings</button>
                </div>

                <div class="cam-content">
                    <div id="search-content">
                        <div class="cam-section">
                            <div class="cam-section-title">
                                <div class="cam-section-icon">🎬</div>
                                Main Sites
                            </div>
                            <div class="cam-main-sites">
                                <button class="cam-main-btn cam-pulse" data-site="stripchat">
                                    <span class="cam-main-btn-icon">💜</span>
                                    <span>Stripchat</span>
                                </button>
                                <button class="cam-main-btn cam-pulse" data-site="chaturbate">
                                    <span class="cam-main-btn-icon">🧡</span>
                                    <span>Chaturbate</span>
                                </button>
                            </div>
                            ${currentSite === 'stripchat' ? `
                            <button class="cam-stealth-btn cam-glow" id="stealth-btn">
                                <span>🕵️</span>
                                <span>Stealth Mode</span>
                            </button>
                            ` : ''}
                        </div>

                        <div class="cam-section">
                            <div class="cam-section-title">
                                <div class="cam-section-icon">📚</div>
                                Archive Sites
                                <span id="check-status" style="margin-left: auto; font-size: 12px; color: rgba(255, 255, 255, 0.5);"></span>
                            </div>
                            <div class="cam-archives-grid">
                                ${archiveSites.map(site => `
                                    <button class="cam-archive-btn" data-url="${site.url}" data-domain="${site.domain}" style="--btn-color: ${site.color};">
                                        <div class="cam-archive-icon">
                                            <img src="${getFaviconUrl(site.domain)}"
                                                 alt="${site.name}"
                                                 onerror="this.parentElement.classList.add('fallback'); this.parentElement.innerHTML='🌐';"
                                                 loading="lazy">
                                        </div>
                                        <span>${site.name}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <button class="cam-save-btn" id="save-profile-btn">
                            <span>💾</span>
                            <span>Save Profilee</span>
                        </button>
                    </div>

                    <div id="saved-content" style="display: none;">
                        <div id="saved-profiles-list"></div>
                    </div>

                    <div id="settings-content" style="display: none;">
                        <div class="cam-settings-section">
                            <div class="cam-settings-header">
                                <div class="cam-settings-icon">💾</div>
                                <span>Data Management</span>
                            </div>
                            <div class="cam-settings-group">
                                <button class="cam-settings-btn" id="export-btn">
                                    <span>📤</span> Export Profilees (.json)
                                </button>
                                <button class="cam-settings-btn" id="import-btn">
                                    <span>📥</span> Import Profilees (.json)
                                </button>
                                <input type="file" id="import-file" accept=".json" style="display: none;">
                            </div>
                        </div>

                        <div class="cam-settings-section">
                            <div class="cam-settings-header">
                                <div class="cam-settings-icon">⚡</div>
                                <span>Performance</span>
                            </div>
                            <div class="cam-settings-group">
                                <label class="cam-toggle-wrapper">
                                    <span class="cam-toggle-label">Low Power Mode</span>
                                    <div class="cam-toggle-description">Disables all animations and effects for better performance</div>
                                    <input type="checkbox" id="low-power-toggle" class="cam-toggle-input">
                                    <span class="cam-toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="cam-settings-section">
                            <div class="cam-settings-header">
                                <div class="cam-settings-icon">ℹ️</div>
                                <span>About</span>
                            </div>
                            <div class="cam-settings-info">
                                <div>Version: 6.3</div>
                                <div>Profilees Saved: <span id="profile-count">0</span></div>
                                <div>Low Power: <span id="power-status">OFF</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(menu);
            document.body.appendChild(backdrop);
            document.body.appendChild(container);

            // Add event listeners
            this.attachEventListeners(currentSite);
            this.updateSavedProfilees();

            // Start preloading if username is available
            if (currentUsername) {
                this.preloadArchiveSites(currentUsername);
            }
        },

        preloadArchiveSites: async function(username) {
            if (!username) return;

            const buttons = document.querySelectorAll('.cam-archive-btn');
            const statusEl = document.getElementById('check-status');

            if (statusEl) {
                statusEl.textContent = 'Checking availability...';
            }

            let checked = 0;
            let available = 0;

            // Check all buttons in parallel
            const checks = Array.from(buttons).map(async (btn) => {
                const urlTemplate = btn.getAttribute('data-url');
                const url = urlTemplate.replace('{username}', username);

                btn.classList.add('checking');

                try {
                    const exists = await PageChecker.checkPage(url);

                    btn.classList.remove('checking');

                    if (exists) {
                        btn.classList.add('available');
                        btn.classList.remove('unavailable');
                        available++;
                    } else {
                        btn.classList.add('unavailable');
                        btn.classList.remove('available');
                    }
                } catch (error) {
                    console.error('Error checking:', url, error);
                    btn.classList.remove('checking');
                    btn.classList.add('unavailable');
                }

                checked++;
                if (statusEl) {
                    statusEl.textContent = `Checked ${checked}/${buttons.length}`;
                }
            });

            await Promise.all(checks);

            if (statusEl) {
                statusEl.textContent = `${available}/${buttons.length} available`;
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
            }
        },

        extractUsername: function(currentSite) {
            const path = window.location.pathname;
            const segments = path.split('/').filter(s => s.length > 0);

            if (currentSite === 'chaturbate' && path.match(/^\/[^\/]+\/?$/)) {
                return segments[0];
            } else if (currentSite === 'stripchat' && segments.length > 0) {
                return segments[segments.length - 1];
            }
            return null;
        },

        attachEventListeners: function(currentSite) {
            // Close button
            document.querySelector('.cam-close-btn').onclick = () => {
                document.querySelector('.cam-menu-container').remove();
                document.querySelector('.cam-menu-backdrop').remove();
            };

            // Backdrop click
            document.querySelector('.cam-menu-backdrop').onclick = () => {
                document.querySelector('.cam-menu-container').remove();
                document.querySelector('.cam-menu-backdrop').remove();
            };

            // Tabs
            document.querySelectorAll('.cam-tab').forEach(tab => {
                tab.onclick = () => {
                    document.querySelectorAll('.cam-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const tabName = tab.dataset.tab;
                    document.getElementById('search-content').style.display = tabName === 'search' ? 'block' : 'none';
                    document.getElementById('saved-content').style.display = tabName === 'saved' ? 'block' : 'none';
                    document.getElementById('settings-content').style.display = tabName === 'settings' ? 'block' : 'none';

                    if (tabName === 'saved') this.updateSavedProfilees();
                    if (tabName === 'settings') this.updateSettings();
                };
            });

            // Username input change - trigger recheck
            const usernameInput = document.getElementById('username-input');
            let checkTimeout;
            usernameInput.oninput = () => {
                clearTimeout(checkTimeout);
                const username = usernameInput.value.trim();

                if (username) {
                    // Reset all buttons
                    document.querySelectorAll('.cam-archive-btn').forEach(btn => {
                        btn.classList.remove('available', 'unavailable', 'checking');
                    });

                    // Clear cache for new username
                    PageChecker.clearCache();

                    // Debounce the check
                    checkTimeout = setTimeout(() => {
                        this.preloadArchiveSites(username);
                    }, 1000);
                }
            };

            // Main site buttons
            document.querySelectorAll('.cam-main-btn').forEach(btn => {
                btn.onclick = () => {
                    const username = usernameInput.value.trim();
                    if (!username) {
                        this.showToast('Please enter a username!', 'error');
                        return;
                    }
                    const site = btn.dataset.site;
                    const url = mainSites[site].replace('{username}', username);
                    window.open(url, '_blank');
                };
            });

            // Stealth mode button (Stripchat only)
            const stealthBtn = document.getElementById('stealth-btn');
            if (stealthBtn) {
                stealthBtn.onclick = () => {
                    const username = usernameInput.value.trim();
                    if (!username) {
                        this.showToast('Please enter a username!', 'error');
                        return;
                    }
                    const url = `https://stripchat.com/${username}?classicGoLive=true`;
                    window.open(url, '_blank');
                };
            }

            // Archive buttons
            document.querySelectorAll('.cam-archive-btn').forEach(btn => {
                btn.onclick = () => {
                    // Don't open if unavailable
                    if (btn.classList.contains('unavailable')) {
                        return;
                    }

                    const username = usernameInput.value.trim();
                    if (!username) {
                        this.showToast('Please enter a username!', 'error');
                        return;
                    }
                    const urlTemplate = btn.dataset.url;
                    const url = urlTemplate.replace('{username}', username);
                    window.open(url, '_blank');
                };
            });

            // Save profile button
            const saveBtn = document.getElementById('save-profile-btn');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const username = usernameInput.value.trim();
                    if (!username) {
                        this.showToast('Please enter a username!', 'error');
                        return;
                    }
                    if (ProfileeManager.saveProfilee(username)) {
                        this.showToast(`Profilee "${username}" saved!`, 'success');
                    } else {
                        this.showToast('Profilee already exists!', 'info');
                    }
                };
            }

            // Settings: Export button
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.onclick = () => {
                    const profiles = ProfileeManager.getProfilees();
                    const dataStr = JSON.stringify({
                        version: '6.3',
                        exportDate: new Date().toISOString(),
                        profiles: profiles
                    }, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                    const exportLink = document.createElement('a');
                    exportLink.setAttribute('href', dataUri);
                    exportLink.setAttribute('download', `cam_profiles_${Date.now()}.json`);
                    document.body.appendChild(exportLink);
                    exportLink.click();
                    document.body.removeChild(exportLink);

                    this.showToast(`Exported ${profiles.length} profiles!`, 'success');
                };
            }

            // Settings: Import button
            const importBtn = document.getElementById('import-btn');
            const importFile = document.getElementById('import-file');
            if (importBtn && importFile) {
                importBtn.onclick = () => importFile.click();

                importFile.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (data.profiles && Array.isArray(data.profiles)) {
                                Storage.set(ProfileeManager.STORAGE_KEY, data.profiles);
                                this.showToast(`Imported ${data.profiles.length} profiles!`, 'success');
                                this.updateSettings();
                            } else {
                                this.showToast('Invalid file format!', 'error');
                            }
                        } catch (error) {
                            this.showToast('Error reading file!', 'error');
                        }
                    };
                    reader.readAsText(file);
                };
            }

            // Settings: Low Power Mode toggle
            const lowPowerToggle = document.getElementById('low-power-toggle');
            if (lowPowerToggle) {
                // Load saved state
                const isLowPower = Storage.get('lowPowerMode', false);
                lowPowerToggle.checked = isLowPower;
                if (isLowPower) {
                    document.body.classList.add('low-power-mode');
                }

                lowPowerToggle.onchange = () => {
                    const enabled = lowPowerToggle.checked;
                    Storage.set('lowPowerMode', enabled);

                    if (enabled) {
                        document.body.classList.add('low-power-mode');
                        this.showToast('Low Power Mode enabled!', 'info');
                    } else {
                        document.body.classList.remove('low-power-mode');
                        this.showToast('Low Power Mode disabled!', 'info');
                    }

                    document.getElementById('power-status').textContent = enabled ? 'ON' : 'OFF';
                };
            }
        },

        updateSettings: function() {
            const profiles = ProfileeManager.getProfilees();
            const profileCount = document.getElementById('profile-count');
            if (profileCount) {
                profileCount.textContent = profiles.length;
            }

            const powerStatus = document.getElementById('power-status');
            if (powerStatus) {
                const isLowPower = Storage.get('lowPowerMode', false);
                powerStatus.textContent = isLowPower ? 'ON' : 'OFF';
            }
        },

        updateSavedProfilees: function() {
            const container = document.getElementById('saved-profiles-list');
            if (!container) return;

            const profiles = ProfileeManager.getProfilees();

            if (profiles.length === 0) {
                container.innerHTML = `
                    <div class="cam-saved-empty">
                        <div class="cam-saved-empty-icon">📌</div>
                        <div>No saved profiles yet</div>
                        <div style="font-size: 12px; margin-top: 8px;">Save profiles to access them quickly</div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="cam-saved-list">
                        ${profiles.map(profile => `
                            <div class="cam-saved-item">
                                <span class="cam-saved-name">${profile}</span>
                                <div class="cam-saved-actions">
                                    <button class="cam-saved-action" onclick="window.open('https://stripchat.com/${profile}', '_blank')">
                                        <span>💜</span> SC
                                    </button>
                                    <button class="cam-saved-action" onclick="window.open('https://chaturbate.com/${profile}/', '_blank')">
                                        <span>🧡</span> CB
                                    </button>
                                    <button class="cam-saved-action delete" data-profile="${profile}">
                                        <span>🗑️</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;

                // Add delete handlers
                document.querySelectorAll('.cam-saved-action.delete').forEach(btn => {
                    btn.onclick = () => {
                        const profile = btn.dataset.profile;
                        if (ProfileeManager.removeProfilee(profile)) {
                            this.showToast(`Profilee "${profile}" removed.`, 'success');
                            this.updateSavedProfilees();
                        }
                    };
                });
            }
        },

        showToast: function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `cam-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    };

    // Initialize
    function init() {
        injectStyles();

        // Check for Low Power Mode on startup
        const isLowPower = Storage.get('lowPowerMode', false);
        if (isLowPower) {
            document.body.classList.add('low-power-mode');
        }

        // Create floating button
        const floatingBtn = document.createElement('button');
        floatingBtn.id = 'floating-cam-btn';
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
            animation: float 3s ease-in-out infinite;
        `;
        floatingBtn.innerHTML = '🌟';
        floatingBtn.onclick = () => UI.createMenu();

        if (!isLowPower) {
            floatingBtn.onmouseenter = () => {
                floatingBtn.style.transform = 'scale(1.1) rotate(15deg)';
            };
            floatingBtn.onmouseleave = () => {
                floatingBtn.style.transform = 'scale(1) rotate(0deg)';
            };
        }

        document.body.appendChild(floatingBtn);
    }

    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
})();
