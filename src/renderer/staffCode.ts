/**
 * Sample code written by PiE staff that may be loaded into the editor with a toolbar button.
 */
export default `# NOTE FROM PIE STAFF
# This code has not been tested thoroughly on robots; it is meant to be guidance to help improve
# the code you currently have. It will be tested throughout the week and will be available for you
# to use during final competition if you are unable to get working code on your testing day.
# (And yes, it is intentionally hard to use....)

# Device IDs
MOTOR_ID = "6_1"
ARM_MOTOR_ID = "6_2"
LINE_FOLLOWER_ID = "2_3"

# Motors
LEFT_MTR = "b"
RIGHT_MTR = "a"
ARM_MTR = "b"

# Controls (change these to your preferences)
LEFT_MOTOR_FORWARD = "q"
LEFT_MOTOR_BACKWARD = "w"
RIGHT_MOTOR_FORWARD = "o"
RIGHT_MOTOR_BACKWARD = "p"

ARM_DOWN = "t"
ARM_UP = "u"

# Arm positions 
# (NOT TESTED! You need to find positions that work based on your arm and your reference encoder value)
ARM_DOWN_POS = 25
ARM_UP_POS = 75

# Motor Inversions (need to specify / change depending on your control scheme)
LEFT_MTR_INVERT = False
RIGHT_MTR_INVERT = True

# Misc
ARM_SPEED = 0.05 # Change this

def autonomous():
    # Set motor inversions
    Robot.set_value(MOTOR_ID, "invert_" + LEFT_MTR, LEFT_MTR_INVERT)
    Robot.set_value(MOTOR_ID, "invert_" + RIGHT_MTR, RIGHT_MTR_INVERT)

    # Disable motor PID
    Robot.set_value(MOTOR_ID, "pid_enabled_" + LEFT_MTR, False)
    Robot.set_value(MOTOR_ID, "pid_enabled_" + RIGHT_MTR, False)

    # Tell PiE staff to put arm into reset position before running
    # This line will set the position of the arm to an encoder value of 0
    Robot.set_value(ARM_MOTOR_ID, "enc_" + ARM_MTR, 0)

    # Autonomous code can go here (or, if more complex,
    # put in separate function and Robot.run() in autonomous_setup() )
    Robot.set_value(MOTOR_ID, "velocity_" + LEFT_MTR, -0.15)
    Robot.set_value(MOTOR_ID, "velocity_" + RIGHT_MTR, 0.15)

def arm_code():
    arm_target_pos = ARM_DOWN_POS
    while True:
        # Get the current target position of the arm
        if Keyboard.get_value(ARM_DOWN):
            arm_target_pos = ARM_DOWN_POS
        elif Keyboard.get_value(ARM_UP):
            arm_target_pos = ARM_UP_POS

        # Drive the arm motor to go to the target position USING ENCODERS (think hard about how you can use this to your advantage!)
        # Ask PiE staff what these do and refer to the student API!
        current_pos = Robot.get_value(ARM_MOTOR_ID, "enc_" + ARM_MTR) # Retrieves current position of the arm motor

        # Sets motor going in the correct direction based on whether the arm is on one side or the other side of the target position
        if current_pos < arm_target_pos:
            Robot.set_value(ARM_MOTOR_ID, "velocity_" + ARM_MTR, ARM_SPEED)
        elif current_pos > arm_target_pos:
            Robot.set_value(ARM_MOTOR_ID, "velocity_" + ARM_MTR, ARM_SPEED * -1.0)
        else:
            Robot.set_value(ARM_MOTOR_ID, "velocity_" + ARM_MTR, 0.0)

def teleop():
    # Start the arm_code() function running simultaneously with rest of teleop function
    # Robot.run(arm_code)

    # Drive code
    while True:
      if Keyboard.get_value(LEFT_MOTOR_FORWARD):
          Robot.set_value(MOTOR_ID, "velocity_" + LEFT_MTR, 1.0)
      elif Keyboard.get_value(LEFT_MOTOR_BACKWARD):
          Robot.set_value(MOTOR_ID, "velocity_" + LEFT_MTR, -1.0)
      else:
          Robot.set_value(MOTOR_ID, "velocity_" + LEFT_MTR, 0.0)

      if Keyboard.get_value(RIGHT_MOTOR_FORWARD):
          Robot.set_value(MOTOR_ID, "velocity_" + RIGHT_MTR, 1.0)
      elif Keyboard.get_value(RIGHT_MOTOR_BACKWARD):
          Robot.set_value(MOTOR_ID, "velocity_" + RIGHT_MTR, -1.0)
      else:
          Robot.set_value(MOTOR_ID, "velocity_" + RIGHT_MTR, 0.0)
` as string;
