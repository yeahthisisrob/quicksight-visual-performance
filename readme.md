# QuickSight Visual Performance

## Overview

QuickSight Visual Performance is a Chrome extension designed to analyze HAR (HTTP Archive) files for optimizing visual performance in Amazon QuickSight. Inspired by Apache Calcite's parsing capabilities, this tool estimates costs based on QuickSight expressions and supports slicing data by multiple levels for detailed analysis.

## Project Details

- **Generated Content**: This entire project, including the README.md, was created using AI without direct human input. The initial commit marks the beginning of ongoing development and refinement.
- **Local Development**: To run the project locally, execute `npm run start`. Note that only `viewer.html` works in local development due to Chrome API limitations, using a mock HAR file for testing purposes.

## Features

- **HAR File Analysis**: Analyze HAR files to optimize visual performance metrics in QuickSight dashboards.
- **Cost Estimation**: Estimate costs based on parsed QuickSight expressions, similar to Apache Calcite's capabilities.
- **Multi-level Slicing**: Slice data by various dimensions to uncover performance bottlenecks at different levels.

## Installation

To use the extension, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/quicksight-visual-performance.git
   ```

2. **Navigate to the repository directory:**

   ```bash
   cd quicksight-visual-performance
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Build the project:**

   ```bash
   npm run build
   ```

5. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`.
   - Enable Developer mode (toggle switch at the top-right).
   - Click on "Load unpacked" and select the `dist` directory from the cloned repository.

## Usage

Once installed, the extension appears in the Chrome toolbar. Click on the extension icon to analyze HAR files and optimize QuickSight visual performance.

## Contributing

Contributions are welcome! If you have suggestions, improvements, or bug fixes, please fork the repository and create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
