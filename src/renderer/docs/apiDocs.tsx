import { ReactNode } from 'react';
import ApiLink from './ApiLink';
import HighlightedCode from './HighlightedCode';

export type ApiDoc = {
  title: string;
  body: () => ReactNode;
};

const apiDocs: {
  [matchText: string]: ApiDoc;
} = {
  'api/Robot': {
    title: 'Robot',
    body: () => (
      <div>
        The <code>Robot</code> object allows your code to control and read data
        from PiE devices connected to your robot. It is available to your code
        as a global, but only when your{' '}
        <ApiLink dest="misc/entry-points" code={true}>autonomous()</ApiLink> or
        {' '}<ApiLink dest="misc/entry-points" code={true}>teleop()</ApiLink>
        {' '}functions are running.
      </div>
    ),
  },
  'api/Robot.start_pos': {
    title: 'Robot.start_pos',
    body: () => (
      <div>
        When your code is run, this member holds a string of either{' '}
        <code>'left'</code> or <code>'right'</code> depending on the starting
        position of your robot. Consult the game manual for which starting
        position is considered the "left" one.
      </div>
    ),
  },
  'api/Robot.get_value': {
    title: 'Robot.get_value(device_id, param)',
    body: () => (
      <div>
        <p>
          The <code>get_value()</code> function returns the current value of a
          specified <code>param</code> on a device with the specified{' '}
          <ApiLink dest="misc/device-id" code={true}>device_id</ApiLink>.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>device_id</code>: the string ID that specifies which PiE
            device will be read.
          </li>
          <li>
            <code>param</code>: the string name of the parameter on the
            specified PiE device will be read. Possible param values depend on
            the specified device. Find a list of params for each type of
            device on the{' '}
            <ApiLink dest="misc/lowcar-devices">lowcar devices</ApiLink> page.
          </li>
        </ul>
        <p>
          The function is useful for checking the current state of devices. For
          example, getting the current state of a limit switch using its{' '}
          <code>device_id</code> and the <code>param</code> &quot;switch0&quot;
          will return True when the switch on the first slot is pressed down and
          False if not.
        </p>
        <HighlightedCode>{`
          limit_switch = "//INSERT SWITCH ID HERE//"

          def teleop():
            # Example code for getting the value of a limit switch
            #   First parameter is the limit switch's id
            #   Second parameter tells which switch to get the value from
            # In this case the method will return True or False depending on if the first switch is pressed down or not

            switch0_pressed = Robot.get_value(limit_switch, "switch0")
        `}</HighlightedCode>
      </div>
    ),
  },
  'api/Robot.set_value': {
    title: 'Robot.set_value(device_id, param, value)',
    body: () => (
      <div>
        <p>
          The <code>set_value()</code> function sets the specified value of the
          specified param of the device with the specified{' '}
          <ApiLink dest="misc/device-id" code={true}>device_id</ApiLink>.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>device_id</code>: the string ID that specifies which PiE
            device will have its parameter set.
          </li>
          <li>
            <code>param</code>: the string name of the parameter on the
            specified PiE device will be set to the provided value. Possible
            values/parameters depend on the specified device. Find a list of
            parameters that can be set for each device on the{' '}
            <ApiLink dest="misc/lowcar-devices">lowcar devices</ApiLink> page.
          </li>
          <li>
            <code>value</code>: the value to set the param to. Depending on
            the param, this may be an int, bool, or a float.
          </li>
        </ul>
        <p>
          This function is useful for changing the state of certain parts of your
          robot while it is running. For example, calling this function with a
          KoalaBear (motor controller)'s ID, the param <code>"velocity_a"</code>
          {' '}and the value <code>-1.0</code> would drive the motor connected to slot
          1 on the KoalaBear backwards at full power.
        </p>
        <HighlightedCode>{`
          # The ID of the motor controller both of the motors must be plugged in to.
          controller_id = "6_XXXXXXXXXXXXX"

          def autonomous():
            # During autonomous, set the motor in the first slot to drive in reverse and the motor in the second slot to drive forward.
            # Because no code ever tells them to stop, they will continue driving until the end of the opmode.

            Robot.set_value(controller_id, "velocity_a", -1.0)
            Robot.set_value(controller_id, "velocity_b", 1.0)
        `}</HighlightedCode>
      </div>
    ),
  },
  'api/Robot.run': {
    title: 'Robot.run(function, *args)',
    body: () => (
      <div>
        <p>
          Executes <code>function</code> with the rest of the arguments passed to{' '}
          <code>Robot.run()</code> (indicated by <code>*args</code>) in a new
          thread. This means <code>function</code> will be ran simultaneously and
          independently from the code that called <code>Robot.run()</code>.
          See below for restrictions.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>function</code>: the function in student code that will be
            run simultaneously with the calling code.
          </li>
          <li>
            <code>*args</code>: if there are any other arguments passed to{' '}
            <code>Robot.run()</code> after <code>function</code>, they will be
            passed to <code>function</code> when it is called in the other
            thread.
          </li>
        </ul>
        <p>
          This will run the specified function in the background until it returns,
          or when the opmode ends (whichever is first). For example, if you want a
          function <code>arm_code()</code> to control the arm that runs at the
          same time as the rest of your <code>teleop()</code> function, call{' '}
          <code>Robot.run(arm_code)</code>:
        </p>
        <HighlightedCode>{`
          def counter(start, should_print):
            i = start
            while True:
              i = i + 1
              if should_print:
                print("Counter is " + i)
              Robot.sleep(1)

          def arm_code():
            while True:
              # Read inputs, control arm, etc.

          def teleop():
            # 42 and True are passed to counter
            Robot.run(counter, 42, True)
            Robot.run(arm_code)
            # The rest of teleop continues while those functions are running

            # Read inputs, control rest of robot, etc.
        `}</HighlightedCode>
        <p>
          Restrictions:
        </p>
        <ul>
          <li>
            <code>Robot.run()</code> cannot run the same function multiple times
            at once. To check if a function run by <code>Robot.run()</code> has
            finished running (and is ready to be run again if desired), use{' '}
            <ApiLink dest="api/Robot.is_running" code={true}>
              Robot.is_running()
            </ApiLink>.
          </li>
          <li>
            No more than 8 functions started by <code>Robot.run()</code> may
            be run at the same time. When 8 functions are running, additional
            calls to <code>Robot.run()</code> will print a warning instead of
            running a new function.
          </li>
        </ul>
      </div>
    ),
  },
  'api/Robot.is_running': {
    title: 'Robot.is_running(function)',
    body: () => (
      <div>
        <p>
          Returns <code>True</code> or <code>False</code> depending on if the
          specified function is still running if started by{' '}
          <ApiLink dest="api/Robot.run" code={true}>Robot.run()</ApiLink>.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>function</code>: a function in student code that may or may
            not have been run using <code>Robot.run()</code>.
          </li>
        </ul>
      </div>
    ),
  },
  'api/Robot.sleep': {
    title: 'Robot.sleep(seconds)',
    body: () => (
      <div>
        <p>
          Pauses the execution of the function that called
          <code>Robot.sleep()</code> for the specified duration. This does not
          affect the execution of other functions ran by{' '}
          <ApiLink dest="api/Robot.run" code={true}>Robot.run()</ApiLink>, or the{' '}
          <code>teleop()</code> and <code>autonomous()</code> functions if they
          were not the functions that called <code>Robot.sleep()</code>. This is
          the only PiE-safe method to add delays to your code; functions in the
          Python standard library are not guaranteed to work on the robot.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>seconds</code>: the number of seconds to pause the execution
            of the current function for. Does not have to be a whole number.
          </li>
        </ul>
      </div>
    ),
  },
  'api/Gamepad': {
    title: 'Gamepad',
    body: () => (
      <div>
        A global object similar to <ApiLink dest="api/Robot">Robot</ApiLink>
        {' '}that is only made available while an{' '}
        <ApiLink dest="misc/entry-points">entry point function</ApiLink> is
        being run. Has only one useful method,{' '}
        <ApiLink dest="api/Gamepad.get_value">Gamepad.get_value()</ApiLink>.
      </div>
    ),
  },
  'api/Gamepad.get_value': {
    title: 'Gamepad.get_value(name_of_input)',
    body: () => (
      <div>
        <p>
          Returns the state of a button or joystick on a connected gamepad. If
          called outside of <ApiLink dest="misc/entry-points">teleop()</ApiLink>,
          an error will be raised.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>name_of_input</code>: a string identifying the button or
            joystick value to return.
          </li>
        </ul>
        <p>
          This function is essential for controlling your robot with the
          gamepad. For example, calling this function with{' '}
          <code>"button_a"</code> would return <code>True</code> if the A button
          is pressed down and <code>False</code> if it is not. The possible
          values for <code>name_of_input</code> are:
        </p>
        <ul>
          <li>"joystick_left_x"</li>
          <li>"joystick_left_y"</li>
          <li>"joystick_right_x"</li>
          <li>"joystick_right_y"</li>
          <li>"button_a"</li>
          <li>"button_b"</li>
          <li>"button_x"</li>
          <li>"button_y"</li>
          <li>"l_bumper"</li>
          <li>"r_bumper"</li>
          <li>"l_trigger"</li>
          <li>"r_trigger"</li>
          <li>"button_back"</li>
          <li>"button_start"</li>
          <li>"l_stick"</li>
          <li>"r_stick"</li>
          <li>"dpad_up"</li>
          <li>"dpad_down"</li>
          <li>"dpad_left"</li>
          <li>"dpad_right"</li>
          <li>"button_xbox"</li>
        </ul>
        <p>
          Users should be careful to distinguish between values such as
          "l_stick" and values such as "joystick_left_x". "l_stick" returns
          whether the joystick has been depressed like a button.
          "joystick_left_x" returns how far the joystick is moved on the x-axis.
        </p>
        <p>
          When the name of a button is passed in, this function returns a
          boolean value: <code>True</code> if the button is pressed, and{' '}
          <code>False</code> if the button is not pressed. When a joystick name
          is passed in, this function returns a floating-point (decimal) value
          between -1.0 and 1.0 (inclusive), which correspond to the extremes of
          movement for the given joystick. On most gamepads, positive values for
          x point rightward while positive values for y point downward.
        </p>
        <p>
          If you are unsure what name a button or joystick on your gamepad is
          called, click the gamepad icon in the top right corner of Dawn. This
          will open a menu that will list the current states of each of the
          gamepad controls with their names, letting you identify which ones
          you're pressing. If you're having other issues with using your
          gamepad, see{' '}
          <ApiLink dest="debug/gamepad">gamepad troubleshooting</ApiLink>.
        </p>
      </div>
    ),
  },
  'api/Keyboard': {
    title: 'Keyboard',
    body: () => (
      <div>
        A global object similar to <ApiLink dest="api/Robot">Robot</ApiLink>
        {' '}that is only made available while an{' '}
        <ApiLink dest="misc/entry-points">entry point function</ApiLink> is
        being run. Has only one useful method,{' '}
        <ApiLink dest="api/Keyboard.get_value">Keyboard.get_value()</ApiLink>.
      </div>
    ),
  },
  'api/Keyboard.get_value': {
    title: 'Keyboard.get_value(name_of_key)',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'misc/entry-points': {
    title: 'Robot code entry points',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'misc/device-id': {
    title: 'Device IDs',
    body: () => (
      <div>
        A string of the form{' '}
        <code>&lt;device_type&gt;_&lt;device_uid&gt;</code>. You can find the
        IDs of all attached devices in the devices panel on the right side of
        Dawn when the robot is on and connected.
      </div>
    ),
  },
  'misc/lowcar-devices': {
    title: 'Lowcar devices',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'misc/important-links': {
    title: 'Important links',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'debug/gamepad': {
    title: 'Gamepad troubleshooting',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'debug/keyboard': {
    title: 'Keyboard troubleshooting',
    body: () => (
      <div>
        WIP
      </div>
    ),
  },
  'debug/connection': {
    title: 'Connecting to the robot',
    body: () => (
      <div>
        <ul>
          <li>
            Make sure the robot has a battery and is switched on.
          </li>
          <li>
            Push the switch on the PDB (the board the battery is connected to)
            INWARDS, away from the USB ports. The red 7-segment display should
            flash the word "LOC" after the "ALL" battery reading.
          </li>
          <li>
            Make sure your team router is plugged in and has power. A green light
            should be visible.
          </li>
          <li>
            Connect the computer running Dawn to the router. It will be named TeamXX
            where XX is your team number, and the password will be on the back of the
            router.
          </li>
          <li>
            Open Dawn and click the WI-FI icon in the top right corner. The IP address
            should be 192.168.0.1XX, where XX is your team number. (Some teams' robot IP
            may be 192.168.0.2XX, but this is normally reserved for staff robots. A
            staff member will inform you if your robot has an IP like this.)
          </li>
        </ul>
      </div>
    ),
  },
  'debug/wiring': {
    title: 'Wiring checklist',
    body: () => (
      <div>
        <p>
          <strong>Not intended to be a complete tutorial.</strong>
          Schedule a worksession or message the PiE Discord for comprehensive wiring help.
        </p>
        <p>
          Make sure the following wires are securely connected on your robot:
        </p>
        <ul>
          <li>
            The battery to the PDB :&rparen;
          </li>
          <li>
            USB-A to USB-C: PDB to Raspberry Pi. Use any port on the PDB except
            the "data1" port, which is the leftmost port if the USB ports are facing you.
          </li>
          <li>
            USB-A to USB-A: PDB data1 port to a USB-A 3.0 port (blue) on the Pi.
          </li>
          <li>
            USB hub plugged in to a USB-A 3.0 port on the Pi.
          </li>
          <li>
            For each motor controller:
            <ul>
              <li>
                Red/black connector: motor controller to the PDB.
              </li>
              <li>
                USB-B to USB-A: motor controller to the USB hub.
              </li>
              <li>
                For each motor:
                <ul>
                  <li>
                    Blue/yellow connector: motor to the motor controller.
                  </li>
                  <li>
                    Encoder wire (4 or 6 pin connector): motor to the motor
                    controller. Orient the motor controller so the encoder pins
                    are on your side. The white encoder wire should connect to
                    the rightmost pin. Make sure the motor is plugged into the
                    same power and encoder slots (e.g. power slot 1 and encoder
                    slot 1).
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            For each servo controller:
            <ul>
              <li>
                For each servo:
                <ul>
                  <li>
                    Wire
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    ),
  },
};

export default apiDocs;
