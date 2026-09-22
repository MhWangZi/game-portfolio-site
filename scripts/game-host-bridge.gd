extends Node
## A small adapter for the website host. Gameplay rules stay in their own scenes.
var _callback: JavaScriptObject
var _window: JavaScriptObject
var _host_paused := false
var _previous_tree_pause := false
var _previous_mute := false
var _previous_render_loop := true
var _previous_time_scale := 1.0
var _audio_states: Array = []
var _process_states: Array = []
var _clock_states: Array = []
var _pause_at_msec := 0
var _paused_total_msec := 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	if not OS.has_feature("web"):
		return
	Engine.set_meta("website_game_clock", get_game_time_msec)
	Engine.set_meta("website_game_exit", request_exit)
	_window = JavaScriptBridge.get_interface("window")
	_callback = JavaScriptBridge.create_callback(_on_command)
	_window.avgGameCommand = _callback
	_emit("bridge-ready")
	get_tree().node_added.connect(_watch_completion)
	var existing: Array = []
	_walk(get_tree().root, existing)
	for node in existing:
		_watch_completion(node)

func _watch_completion(node: Node) -> void:
	# Optional public signal contract; no changes to individual level rules.
	if not node.has_signal("level_completed"):
		return
	var script = node.get_script()
	if script == null:
		return
	var source: String = script.resource_path
	if source.contains("/tutorial/") or source.contains("/tests/"):
		return
	var listener := _report_completion.bind(source)
	if not node.is_connected("level_completed", listener):
		node.connect("level_completed", listener)

func _report_completion(source: String) -> void:
	var payload := JSON.stringify({"type":"challenge-completed", "achievement":"formal-level", "source":source})
	JavaScriptBridge.eval("window.dispatchEvent(new CustomEvent('avg-game-event',{detail:" + payload + "}));")

func _on_command(args: Array) -> void:
	if args.is_empty():
		return
	var command = JSON.parse_string(str(args[0]))
	if not command is Dictionary:
		return
	match command.get("action", ""):
		"pause":
			_pause()
			_emit("paused", str(command.get("requestId", "")))
		"resume":
			_resume()
			_emit("resumed", str(command.get("requestId", "")))
		"inspect":
			_emit("snapshot", str(command.get("requestId", "")))

func _walk(node: Node, result: Array) -> void:
	result.append(node)
	for child in node.get_children():
		_walk(child, result)

func _pause() -> void:
	if _host_paused:
		return
	_pause_at_msec = Time.get_ticks_msec()
	_host_paused = true
	_previous_tree_pause = get_tree().paused
	_previous_mute = AudioServer.is_bus_mute(0)
	_previous_render_loop = RenderingServer.render_loop_enabled
	_previous_time_scale = Engine.time_scale
	_audio_states.clear()
	_process_states.clear()
	_clock_states.clear()
	var nodes: Array = []
	_walk(get_tree().root, nodes)
	for node in nodes:
		if node == self:
			continue
		if node.has_method("host_set_paused"):
			node.call("host_set_paused", true)
			_clock_states.append(weakref(node))
		if node is AudioStreamPlayer or node is AudioStreamPlayer2D or node is AudioStreamPlayer3D:
			_audio_states.append([weakref(node), node.stream_paused])
			node.stream_paused = true
		if node.process_mode == Node.PROCESS_MODE_ALWAYS or node.process_mode == Node.PROCESS_MODE_WHEN_PAUSED:
			_process_states.append([weakref(node), node.process_mode])
			node.process_mode = Node.PROCESS_MODE_PAUSABLE
	AudioServer.set_bus_mute(0, true)
	get_tree().paused = true
	Engine.time_scale = 0.0
	RenderingServer.render_loop_enabled = false

func _resume() -> void:
	if not _host_paused:
		return
	get_tree().paused = _previous_tree_pause
	Engine.time_scale = _previous_time_scale
	RenderingServer.render_loop_enabled = _previous_render_loop
	for state in _process_states:
		var node = state[0].get_ref()
		if node != null:
			node.process_mode = state[1]
	for state in _audio_states:
		var node = state[0].get_ref()
		if node != null:
			node.stream_paused = state[1]
	AudioServer.set_bus_mute(0, _previous_mute)
	for clock in _clock_states:
		var node = clock.get_ref()
		if node != null:
			node.call("host_set_paused", false)
	_paused_total_msec += Time.get_ticks_msec() - _pause_at_msec
	_host_paused = false
	_audio_states.clear()
	_process_states.clear()

func get_game_time_msec() -> int:
	return (_pause_at_msec if _host_paused else Time.get_ticks_msec()) - _paused_total_msec

func request_exit() -> void:
	_pause()
	_emit("exit")

func _emit(event: String, request_id: String = "") -> void:
	var clocks: Array = []
	var audio: Array = []
	var timers: Array = []
	var host_states: Array = []
	var nodes: Array = []
	_walk(get_tree().root, nodes)
	for node in nodes:
		if node.has_method("get_host_state"):
			host_states.append(node.call("get_host_state"))
		if node is Timer and not node.is_stopped():
			timers.append({"node": str(node.get_path()), "remaining": node.time_left})
		if node.has_method("get_song_time_sec") and node is AudioStreamPlayer:
			clocks.append({"node": str(node.get_path()), "position": node.get_playback_position(), "song": node.call("get_song_time_sec")})
		if node is AudioStreamPlayer and node.playing:
			audio.append({"node": str(node.get_path()), "paused": node.stream_paused, "position": node.get_playback_position()})
	var scene := ""
	if get_tree().current_scene != null:
		scene = get_tree().current_scene.scene_file_path
	var payload := JSON.stringify({"type": event, "requestId": request_id, "paused": _host_paused, "treePaused": get_tree().paused, "timeScale": Engine.time_scale, "rendering": RenderingServer.render_loop_enabled, "muted": AudioServer.is_bus_mute(0), "scene": scene, "clocks": clocks, "audio": audio, "timers": timers, "states": host_states})
	JavaScriptBridge.eval("window.dispatchEvent(new CustomEvent('avg-game-event',{detail:" + payload + "}));")
