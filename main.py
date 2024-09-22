import tkinter as tk
from gamepad_input import GamepadInput
import inputs

if __name__ == "__main__":
    root = tk.Tk()
    visualizer = GamepadVisualizer(root)
    root.mainloop()
