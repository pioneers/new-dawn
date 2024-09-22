import inputs

class GamepadInput:
    def __init__(self):
        self.gamepads = inputs.devices.gamepads
        if not self.gamepads:
            raise Exception("No gamepads found. Please connect an Xbox gamepad.")
        self.gamepad = self.gamepads[0]  # Use the first connected gamepad
        self.button_states = {}  # Store button states

    def get_button_state(self, button_code):
        """
        Returns the current state (True/False) of the specified button.
        """
        return self.button_states.get(button_code, False)

    def update_button_states(self, events):
        """
        Updates the internal button states based on the received events.
        """
        for event in events:
            if event.ev_type == "Key":
                self.button_states[event.code] = event.state == 1  # 1 for pressed, 0 for released

    def get_gamepad_events(self):
        """
        Reads and returns gamepad events.
        """
        events = self.gamepad.read()
        self.update_button_states(events)
        return events
