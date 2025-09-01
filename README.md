# 3D Solar System - Hand Gesture Control

A web-based 3D solar system visualization controlled entirely through hand gestures using MediaPipe Hands and Three.js.

## Features

- **3D Solar System**: Realistic 3D rendering of all 8 planets plus the Sun
- **Hand Gesture Controls**: Navigate and interact using only your hand
- **Three Detail Levels**: Get information at different depths based on hand position
- **Smooth Animations**: Fluid camera movements and planet rotations
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Gesture Controls

1. **Thumb Up**: Navigate to next planet
2. **Thumb Down**: Navigate to previous planet
3. **Pointing Up**: Set detail level to deep dive
4. **Victory Sign (✌️)**: Set detail level to detailed
5. **Thumbs Up**: Set detail level to overview
6. **Closed Fist**: Lock current selection
7. **Open Palm**: Unlock selection
8. **Move Hand Closer/Farther**: Alternative way to adjust detail level

### Getting Started

1. Open `index.html` in a modern web browser
2. Allow camera access when prompted
3. Hold your hand in front of the camera
4. Use the gestures above to explore the solar system

## Technical Details

- **3D Engine**: Three.js for WebGL rendering
- **Hand Tracking**: MediaPipe Hands for real-time gesture detection
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern features like backdrop-filter

## Browser Requirements

- Modern browser with WebGL support
- HTTPS connection (required for camera access)
- Camera device for hand tracking

## File Structure

```
├── index.html          # Main HTML file
├── main.js            # JavaScript application logic
├── style.css          # CSS styling for UI overlay
└── README.md          # This file
```

## Dependencies

All dependencies are loaded from CDN:
- Three.js (3D rendering)
- MediaPipe Hands (hand tracking)
- MediaPipe Camera Utils
- MediaPipe Drawing Utils

## Customization

You can easily modify:
- Planet information and descriptions
- Colors and sizes
- Gesture sensitivity
- UI styling and positioning

## Troubleshooting

- **Camera not working**: Ensure you're on HTTPS and have granted camera permissions
- **Hands not detected**: Try adjusting lighting and hand position
- **Performance issues**: Close other browser tabs and ensure hardware acceleration is enabled

## License

This project is open source and available under the MIT License.
