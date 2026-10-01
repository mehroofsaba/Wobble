use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Emitter, Manager};

#[tauri::command]
fn companion(app: tauri::AppHandle, show: bool, on_top: bool) {
    if let Some(w) = app.get_webview_window("companion") {
        let _ = w.set_always_on_top(on_top);
        if show { let _ = w.show(); } else { let _ = w.hide(); }
    }
}

fn open_main(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") { let _ = w.show(); let _ = w.set_focus(); }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![companion])
        .on_window_event(|w, e| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = e {
                if w.label() == "main" { api.prevent_close(); let _ = w.hide(); }
            }
        })
        .setup(|app| {
            let open = MenuItem::with_id(app, "open", "Open Wobble", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide Wobble", true, None::<&str>)?;
            let mute = MenuItem::with_id(app, "mute", "Mute Sounds", true, None::<&str>)?;
            let sets = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &hide, &mute, &sets, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Wobble")
                .menu(&menu)
                .on_menu_event(|app, e| match e.id.as_ref() {
                    "open" => open_main(app),
                    "hide" => { for l in ["main", "companion"] { if let Some(w) = app.get_webview_window(l) { let _ = w.hide(); } } }
                    "mute" => { let _ = app.emit("tray", "mute"); }
                    "settings" => { open_main(app); let _ = app.emit("tray", "settings"); }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Wobble");
}
