# Wobble — your little desktop companion
Requirements: Node.js, Rust (rustup), and the Tauri 2 prerequisites for your OS (WebView2 on Windows).

    npm install
    npx tauri icon app-icon.png     # generates src-tauri/icons (once)
    npm run dev                     # run
    npm run build                   # make installer

Quick preview without Rust: open src/index.html (main app) or src/index.html?c=1 (companion) in a browser.
Tray: Open / Hide / Mute / Settings / Quit. Closing the window hides it to the tray.
Drag the desktop Wobble to move it; its position is remembered. Pet state lives in localStorage (shared by both windows).
