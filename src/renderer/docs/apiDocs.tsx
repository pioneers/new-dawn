import { ReactNode } from 'react';
import ApiLink from './ApiLink';
import HighlightedCode from './HighlightedCode';

export type ApiDoc = {
  title: string;
  body: () => ReactNode;
};

function SelfLink({ href }: { href: string }) {
  return <a href={href}>{href}</a>;
}

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
            # Because no code ever tells them to stop, they will continue driving until the robot is stopped.

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
          This will run the specified function in the background until it returns, or
          when the robot is stopped (whichever is first). For example, if you want a
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
          <li><code>"joystick_left_x"</code></li>
          <li><code>"joystick_left_y"</code></li>
          <li><code>"joystick_right_x"</code></li>
          <li><code>"joystick_right_y"</code></li>
          <li><code>"button_a"</code></li>
          <li><code>"button_b"</code></li>
          <li><code>"button_x"</code></li>
          <li><code>"button_y"</code></li>
          <li><code>"l_bumper"</code></li>
          <li><code>"r_bumper"</code></li>
          <li><code>"l_trigger"</code></li>
          <li><code>"r_trigger"</code></li>
          <li><code>"button_back"</code></li>
          <li><code>"button_start"</code></li>
          <li><code>"l_stick"</code></li>
          <li><code>"r_stick"</code></li>
          <li><code>"dpad_up"</code></li>
          <li><code>"dpad_down"</code></li>
          <li><code>"dpad_left"</code></li>
          <li><code>"dpad_right"</code></li>
          <li><code>"button_xbox"</code></li>
        </ul>
        <p>
          Users should be careful to distinguish between values such as{' '}
          <code>"l_stick"</code> and values such as <code>"joystick_left_x"</code>.
          {' '} <code>"l_stick"</code> returns whether the joystick has been
          depressed like a button. <code>"joystick_left_x"</code> returns how far the
          joystick is moved on the x-axis.
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
        <p>
          Returns a boolean indicating whether a key on the keyboard is pressed.
        </p>
        <p>
          Parameters:
        </p>
        <ul>
          <li>
            <code>name_of_key</code>: a string identifying the key whose state will be returned.
          </li>
        </ul>
        <p>
          This function is essential to controlling your robot with the keyboard.
          Possible values for <code>name_of_key</code> are:
        </p>
        <ul>
          <li>
            The letters on the keyboard, lowercase and no spaces: <code>"a"</code>-<code>"z"</code>
          </li>
          <li>
            The numbers on the keyboard, no spaces: <code>"0"</code>-<code>"9"</code>
          </li>
          <li>
            The punctuation keys: <code>","</code>, <code>"."</code>,{' '}
            <code>"/"</code>, <code>";"</code>, <code>"'"</code>, <code>"["</code>,{' '}
            <code>"]"</code>
          </li>
          <li>
            The four arrow keys: <code>"left_arrow"</code>,{' '}
            <code>"right_arrow"</code>, <code>"up_arrow"</code>,{' '}
            <code>"down_arrow"</code>
          </li>
        </ul>
        <p>
          The function will return <code>True</code> if the button is pressed, and
          <code>False</code> if the button is not pressed.
        </p>
      </div>
    ),
  },
  'misc/entry-points': {
    title: 'Robot code entry points',
    body: () => (
      <div>
        <p>
          Entry points are functions in your code that the robot calls to run the
          program. The <code>autonomous()</code> function is called when the robot is
          started in autonomous mode (meaning human input is disabled) and the{' '}
          <code>teleop()</code> function is called when the robot is started in
          teleoperated mode (human input is allowed).
        </p>
        <p>
          Certain robot APIs are only accessible inside these functions. In general,
          very little code besides definitions of functions called by the entry
          points should be outside the entry point functions.
        </p>
        <HighlightedCode>{`
          controller_id = "6_XXXXXXXXXXXXX"

          def autonomous():
            print('This will print when the robot is started in autonomous mode!')
            Robot.set_value(controller_id, "velocity_a", 1.0)
            Gamepad.get_value("joystick_left_x") # WILL RAISE ERROR

          def teleop():
            print('This will print when the robot is started in teleoperated mode!')
            Robot.set_value(controller_id, "velocity_a", 1.0)
            Gamepad.get_value("joystick_left_x")

          # Note the lack of indentation means this line is outside of the teleop function:
          Robot.set_value(controller_id, "velocity_a", 1.0) # WILL RAISE ERROR
          Gamepad.get_value("joystick_left_x") # WILL RAISE ERROR
        `}</HighlightedCode>
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
        <p>
          Runtime supports devices that implement the "lowcar" protocol. Each device
          has "parameters" describing properties of the device that may be read from
          or written to. Devices are how your robot will interact with the world.
        </p>
        <div>
          <h2>Servo Controller</h2>
          <p>Parameters:</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Readable?</th>
                <th>Writable?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>servo0</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>servo1</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
            </tbody>
          </table>
          <p>
            A servo controller is a device that controls the movement of two servo
            motors it is attached too. Servos are small mechanical devices that allow
            students to make precise movements without the size and weight of a
            regular motor. The tradeoff here is that it has significantly less power
            than a motor and has a smaller range of motion.
          </p>
          <p>
            Both servos, <code>servo0</code> and <code>servo1</code>, serve as
            parameters to the servo controller and are readable and writeable
            parameters. Upon initialization, the servo controller resets the servos
            to a default starting position and sets the values in the position array
            to 0. The servo also isn’t technically connected to a pin on the servo
            controller until the first write to that servo. If already attached or
            after being attached, the servo controller then calculates how much to
            move the servo by depending on its starting position and the input that
            was fed to the servo controller. Each servo has a range of motion of 180
            degrees. We can also read each servo’s current positions by grabbing it
            from the positions array. Each servo’s position is stored as a float.
          </p>
        </div>
        <div>
          <h2>Distance Sensor</h2>
          <p>Parameters:</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Readable?</th>
                <th>Writable?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>distance</td>
                <td>float</td>
                <td>Yes</td>
                <td>No</td>
              </tr>
            </tbody>
          </table>
          <p>
            The distance sensor uses ultrasonic waves and their reflections to detect
            the distance between the sensor and an object in front of it. PiE's
            distance sensors are calibrated to output a number in cm, with the range
            of distance it reads is from 0cm to 500 cm.
          </p>
          <p>
            <em>Note:</em> at the time of writing, the sensor output is noisy and
            will occasionally output a false reading of 0 distance.
          </p>
        </div>
        <div>
          <h2>KoalaBear</h2>
          <p>Parameters:</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Readable?</th>
                <th>Writable?</th>
                <th>Default Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>velocity_a</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.0</td>
              </tr>
              <tr>
                <td>deadband_a</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.05</td>
              </tr>
              <tr>
                <td>invert_a</td>
                <td>bool</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>False</td>
              </tr>
              <tr>
                <td>pid_enabled_a</td>
                <td>bool</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>True</td>
              </tr>
              <tr>
                <td>pid_kp_a</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.05</td>
              </tr>
              <tr>
                <td>pid_ki_a</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.035</td>
              </tr>
              <tr>
                <td>pid_kd_a</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.0</td>
              </tr>
              <tr>
                <td>enc_a</td>
                <td>int</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0</td>
              </tr>
              <tr>
                <td>velocity_b</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.0</td>
              </tr>
              <tr>
                <td>deadband_b</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.05</td>
              </tr>
              <tr>
                <td>invert_b</td>
                <td>bool</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>False</td>
              </tr>
              <tr>
                <td>pid_enabled_b</td>
                <td>bool</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>True</td>
              </tr>
              <tr>
                <td>pid_kp_b</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.05</td>
              </tr>
              <tr>
                <td>pid_ki_b</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.035</td>
              </tr>
              <tr>
                <td>pid_kd_b</td>
                <td>float</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0.0</td>
              </tr>
              <tr>
                <td>enc_b</td>
                <td>int</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
          <p>
            The KoalaBear is a motor controller, a device that manages the speed and
            other related parameters of motors. KoalaBears can control two motors at
            once. For this reason the KoalaBear comes with 16 parameters, making it a
            thicc device. 8 of the parameters are dedicated to “motor A” and the
            other 8 are dedicated to “motor b.”
          </p>
          <p>
            The first parameter is <code>velocity</code>, a float value which
            essentially dictates how powerful the motor should be and in what
            direction. Students are allowed to modify this to be a value between -1
            and 1, where 1 is max power in a clockwise direction and -1 is power in a
            counterclockwise direction.
          </p>
          <p>
            Next is the deadband parameter, which is a float used to create a limit
            that a parameter must meet. Deadbands are typically used to prevent
            oscillation in a circuit. So if the change to some value, such as the
            velocity, is small enough to be less than deadband, then the motor
            controller ignores that change. For example, if upon initialization,
            deadband is set to 0.05, and velocity is set to 0.04, then no action will
            be taken by the motor controller. If velocity is then changed to 0.07,
            then the motor controller will handle that input.
          </p>
          <p>
            The third parameter, invert, allows the student to run the motor in the
            opposite direction as specified. If when the student plugs in the motor,
            they realize that a velocity of 1.0 corresponds to the opposite of the
            preferred direction of positive velocities for the motor, they can set
            invert to True and cause the velocity of 1.0 to correspond to the
            preferred direction for positive velocities.
          </p>
          <p>
            Before moving on to the next set of parameters, we must first talk about
            the other great change with KoalaBear. Each KoalaBear has a built in
            encoder that allows us to utilize PID control! An encoder is basically a
            device that allows us to translate the motor’s movements into actual
            distance values. Each motor's encoder is accessed with two pins. The
            outputs of both pins for an encoder are in the form of square waves at
            the frequency of the motor’s rotation; they are slightly offset from each
            other. By examining the value of one pin relative to another pin when one
            of the pins encounters a rising edge, we can determine which direction
            the motor is rotating. If the voltage of the second pin is 0, then its
            spinning clockwise, but if it's 5 V, it's counterclockwise. This check is
            triggered after each rising edge of the encoder related to either motor A
            or motor B. With these checks, we either increment or decrement the enc_a
            or enc_b integer parameters depending on which motor is the moving and in
            which direction. With this information, we can then implement PID
            control.
          </p>
          <p>
            PID, which stands for proportional integral derivative, is a control loop
            feedback mechanism to control variables and give the most stable outputs.
            Essentially, it uses its own outputs as a variable in the inputs to
            produce accurate outputs. It does this by trying to minimize the “error”
            of the system down to zero. When the system first starts up, its error to
            the outcome is initially high, since we haven’t achieved the desired
            outcome. What I mean by this, is that the closer we get the desired
            outcome, the more our error will decrease which will be taken into
            account by the system. To calculate the error, we must sum three things
            together: the error itself, the accumulated error, and the expected
            error. These three are respectively multiplied by constant weights KP,
            KI, and KD. These K values must be adjusted correctly so that its not
            overtly sensitive or lack sensitivity. For a more in-depth, cohesive
            explanation, check out these videos:{' '}
            <a href="https://www.youtube.com/watch?v=UR0hOmjaHp0">
              God Tier PID explanation
            </a> and{' '}
            <a href="https://www.youtube.com/watch?v=XfAt6hNV8XM">
              PID Examples
            </a>!
          </p>
          <p>
            PID can be used for many scenarios, but in our case, we just want to make
            sure the motor’s drive our robot at the appropriate speed. This is only
            used if the flag pid_enabled is set to true for either motor. When the
            robot moves forward, we use the enc_a/enc_b variables as the current
            position to calculate the error values and the desired output. The
            desired output is a value between [-1,1] that will be used to tell us how
            much to adjust the motor controller pins by. Upon each calculation, the
            values that were generated in this iteration are stored into previous
            values for use at the next calculation. Each motor comes with its own KP,
            KI, and KD variables as floats to use in this calculation.
          </p>
        </div>
      </div>
    ),
  },
  'misc/important-links': {
    title: 'Important links',
    body: () => (
      <div>
        <ul>
          <li>
            Pioneers in Engineering website:{' '}
            <SelfLink href="https://pioneers.berkeley.edu" />
          </li>
          <li>
            Software Hub:{' '}
            <SelfLink href="https://pioneers.berkeley.edu/competition/SoftwareHub/" />
          </li>
          <li>
            Official PiE discord:{' '}
            <SelfLink href="https://discord.gg/ydVHmE52b8" />
          </li>
          <li>
            2025 Game Manual:{' '}
            <SelfLink href="https://docs.google.com/document/d/1eV7FfOQ9Rb22ZusbkcfQg-Tb3dtdPMqhtkMM7ty2fXs/edit" />
          </li>
          <li>
            2025 Take-Home Coding Challenges:{' '}
            <SelfLink href="https://docs.google.com/document/d/1vAAQRsgHYHFyAIccbXXDm09cGVIeEMUXpQk-nRdDj74/edit" />
          </li>
          <li>
            2025 Custom Parts Form:
          </li>
        </ul>
      </div>
    ),
  },
  'debug/gamepad': {
    title: 'Gamepad troubleshooting',
    body: () => (
      <div>
        <ul>
          <li>
            Ensure you are only accessing the{' '}
            <ApiLink dest="api/Gamepad" code={true}>Gamepad</ApiLink> in the{' '}
            <ApiLink dest="misc/entry-points" code={true}>teleop()</ApiLink>
            {' '}function, or a function called from the <code>teleop()</code>
            {' '}function. Inputs may not be accessed during the autonomous
            period.
          </li>
          <li>
            If the message "TELEOP with no input connected" appears in the console
            when running the teleop mode, try pressing any button on the gamepad.
            Dawn cannot access a gamepad until it has been interacted with while
            the Dawn window is open.
          </li>
          <li>
            Click the gamepad icon in the top right corner of Dawn. Pressing
            buttons and moving joysticks on the gamepad should turn parts of the
            gamepad visualizer orange. If nothing happens, try restartng Dawn. If
            the problem persists, the gamepad may be broken. Test it on another
            device that uses a gamepad.
          </li>
        </ul>
      </div>
    ),
  },
  'debug/keyboard': {
    title: 'Keyboard troubleshooting',
    body: () => (
      <div>
        <p>
          Ensure you are only accessing the{' '}
          <ApiLink dest="api/Keyboard" code={true}>Keyboard</ApiLink> in the{' '}
          <ApiLink dest="misc/entry-points" code={true}>teleop()</ApiLink>
          {' '}function, or a function called from the <code>teleop()</code>
          {' '}function. Inputs may not be accessed during the autonomous
          period.
        </p>
        <p>
          Enable keyboard control mode in Dawn with the button that looks like
          an "A" key above the editor. When activated, the editor will be hidden
          by an overlay.
        </p>
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
            Connect the computer running Dawn to the router. It will be named
            TeamXX where XX is your team number, and the password will be on
            the back of the router.
          </li>
          <li>
            Open Dawn and click the WI-FI icon in the top right corner. The IP
            address should be 192.168.0.1XX, where XX is your team number.
            (Some teams' robot IP may be 192.168.0.2XX, but this is normally
            reserved for staff robots. A staff member will inform you if your
            robot has an IP like this.)
          </li>
          <li>
            The robot should connect to Dawn after a short delay. If not:
            <ul>
              <li>
                On the computer running Dawn, open a browser and go to
                <SelfLink href="http://tplinkwifi.net" />. (Note the HTTP
                protocol is used instead of HTTPS.)
              </li>
              </li>
                The username and password are both "admin". If there is only a
                password field, the password is "admin123".
              </li>
              <li>
                Click on "DHCP" in the menu on the left, then on "DHCP clients
                list."
              </li>
              <li>
                There should be exactly two devices listed: the computer you
                are using and the robot, which will be named TeamXX. If there
                are more, disconnect the other computers from the network. If
                the robot is not listed, then the Pi is not connecting to the
                network. Make sure:
                <ul>
                  <li>
                    The robot is powered on.
                  </li>
                  <li>
                    The switch on the PDB is switched away from the USB ports.
                  </li>
                  <li>
                    The router you are using is the router issued to your team
                    <em>for this season.</em>
                  </li>
                </ul>
                If you have reviewed the above steps and the robot is still not
                connected to Dawn, continue.
              </li>
              <li>
                Copy the IP address next to the TeamXX entry in the DHCP
                clients list. If it does not match the IP address in Dawn,
                change it to match.
              </li>
              <li>
                Ensure you have the latest version of Dawn. Older versions may
                have connection issues. Visit
                <SelfLink href="https://pioneers.berkeley.edu/Software-Hub" />
                for the latest stable Dawn version.
              </li>
              <li>
                Close Dawn and power off the robot. After ~5 seconds, power the
                robot on. Open the DHCP clients list (instructions above) and
                refresh until you see the robot (named TeamXX) connect to the
                network. Reopen Dawn.
              </li>
              <li>
                If the issue persists, notify a staff member or post in{' '}
                <ApiLink dest="misc/important-links">the PiE Discord</ApiLink>.
              </li>
            </ul>
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
            USB-A to USB-C: PDB to Raspberry Pi. Use any port on the PDB except
            the "data1" port, which is the leftmost port if the USB ports are
            facing you. Plug the PDB into the Pi directly, not through the USB
            hub.
          </li>
          <li>
            USB-A to USB-A: PDB data1 port to a USB-A 3.0 port (blue) on the
            Pi.
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
