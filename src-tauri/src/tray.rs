use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};

/// 初始化系统托盘
pub fn init_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    // 创建语言子菜单
    let lang_zh = MenuItem::with_id(app, "lang_zh", "中文", true, None::<&str>)?;
    let lang_en = MenuItem::with_id(app, "lang_en", "English", true, None::<&str>)?;
    let lang_submenu = Submenu::with_items(app, "设置语言", true, &[&lang_zh, &lang_en])?;

    // 创建主题子菜单
    let theme_light = MenuItem::with_id(app, "theme_light", "浅色模式", true, None::<&str>)?;
    let theme_dark = MenuItem::with_id(app, "theme_dark", "深色模式", true, None::<&str>)?;
    let theme_system = MenuItem::with_id(app, "theme_system", "跟随系统", true, None::<&str>)?;
    let theme_submenu = Submenu::with_items(app, "设置深色/浅色模式", true, &[&theme_light, &theme_dark, &theme_system])?;

    // 创建主菜单
    let show_i = MenuItem::with_id(app, "show", "显示主界面", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出软件", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &separator, &lang_submenu, &theme_submenu, &separator, &quit_i])?;

    // 构建托盘图标
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("RT Tool")
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "lang_zh" => {
                    let _ = app.emit("tray-set-language", "zh");
                }
                "lang_en" => {
                    let _ = app.emit("tray-set-language", "en");
                }
                "theme_light" => {
                    let _ = app.emit("tray-set-theme", "light");
                }
                "theme_dark" => {
                    let _ = app.emit("tray-set-theme", "dark");
                }
                "theme_system" => {
                    let _ = app.emit("tray-set-theme", "system");
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}