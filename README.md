# 3D Solar System - Hand Gesture Control

A web-based 3D solar system visualization controlled entirely through hand gestures using MediaPipe Hands and Three.js.

** [Watch Demo](https://youtu.be/1E28ZaeKoGE)**

## Features

- **3D Solar System**: Realistic 3D rendering of all 8 planets plus the Sun
- **Hand Gesture Controls**: Navigate and interact using only your hand
- **Two Interaction Modes**: 
  - **Swipe Mode**: Navigate between planets with palm swipes
  - **Rotary Dial Mode**: Adjust detail levels with circular finger movements
- **Three Detail Levels**: Overview, Detailed, and Deep information for each celestial body
- **Smooth Animations**: Fluid camera movements and planet rotations
- **Real-time Hand Tracking**: Live visualization of hand landmarks and gesture detection
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Modern web browser with WebGL support
- HTTPS connection (required for camera access)
- Camera device for hand tracking
- Python 3.x OR Node.js (for local server)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrgehlot/hand_gesture_solar_system.git
   cd hand_gesture_solar_system
   ```

2. **Start a local server** (choose one option):

   **Option A: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Using Node.js (npx)**
   ```bash
   npx http-server -p 8000 --cors
   ```

3. **Open your browser**
   - Navigate to `http://localhost:8000`
   - Allow camera access when prompted
   - Hold your hand in front of the camera
   - Use the gesture controls below to explore the solar system

### Gesture Controls

#### Mode Switching
- **Open Palm** ✋: Unlock and enter **Swipe Mode** for planet navigation
- **Closed Fist** ✊: Lock and enter **Rotary Dial Mode** for detail level control

#### Swipe Mode (Planet Navigation)
- **Swipe Right** 👉: Move to next planet
- **Swipe Left** 👈: Move to previous planet
- *Note: Swipe gestures use palm center tracking for smooth detection*

#### Rotary Dial Mode (Detail Level Control)
- **Clockwise Rotation** 🔄: Increase detail level (Overview → Detailed → Deep)
- **Counter-clockwise Rotation** 🔄: Decrease detail level (Deep → Detailed → Overview)
- *Note: Use all five fingers in a circular motion around the center point*

### Visual Feedback

The application provides real-time visual feedback:
- **Hand Landmarks**: Live tracking of all 21 hand landmarks
- **Finger Tips**: Color-coded finger tips (Blue, Green, Yellow, Orange, Pink)
- **Center Point**: White circle showing the calculated center for rotary dial
- **Debug Panel**: Real-time information about current mode, planet, and gesture detection
- **Mode Indicator**: Clear indication of whether you're in Swipe or Rotary Dial mode

## Technical Details

- **3D Engine**: Three.js for WebGL rendering
- **Hand Tracking**: MediaPipe HandGestureRecognizer for real-time gesture detection
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern features like backdrop-filter

### Gesture Detection
- **Swipe Detection**: Continuous palm center tracking with velocity-based recognition
- **Rotary Dial**: Multi-finger circular motion detection using angle calculations
- **State Management**: Proper isolation between different interaction modes
- **Debouncing**: Prevents accidental rapid gesture triggers

## Browser Requirements

- Modern browser with WebGL support
- HTTPS connection (required for camera access)
- Camera device for hand tracking