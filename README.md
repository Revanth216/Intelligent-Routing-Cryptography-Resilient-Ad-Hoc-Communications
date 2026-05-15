# Intelligent Routing & Cryptography for Resilient Ad-Hoc Communications

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)

An interactive, web-based simulation demonstrating secure data transmission in mobile ad-hoc networks (MANETs). [cite_start]This project visualizes the vulnerabilities of traditional routing protocols to wormhole attacks [cite: 11, 24] [cite_start]and implements a robust mitigation strategy using **Dijkstra's Algorithm** [cite: 14, 98] [cite_start]and the **Schnorr Signature Protocol**[cite: 15, 98].

## 🚀 Live Demo
*https://revanth216.github.io/adhoc/*

## 📖 Project Overview
Ad-hoc networks dynamically form connections without relying on fixed infrastructure, making them ideal for disaster recovery and military deployments. 
However, this flexibility makes them highly susceptible to cyberattacks at the routing layer, particularly wormhole attacks.

This simulation provides a side-by-side comparison of:
1. **Existing Random Routing:** A probabilistic approach that is inefficient, resource-heavy, and easily compromised by malicious nodes.
2. **Proposed Secure Routing:** A dynamic approach that calculates the optimal path using Dijkstra's algorithm and secures the payload using lightweight Schnorr cryptographic authentication.

## ✨ Key Features
* [cite_start]**Dynamic Network Generation:** Procedurally generate nodes based on proximity and communication capacity[cite: 13, 102].
* [cite_start]**Wormhole Attack Simulation:** Injects anomalous distant links to demonstrate how traditional random walks can be hijacked[cite: 27, 28, 255].
* [cite_start]**Signature Verification Protocol:** Validates node authenticity and physical radio thresholds to isolate compromised edges before transmission[cite: 16, 118, 119, 263].
* **Real-time Data Visualization:** Includes an animated system log and a dynamically generated Packet Delivery Ratio (PDR) graph comparing both methodologies.
* **Modern UI/UX:** Features a responsive layout with an integrated Light/Dark mode toggle and a built-in PDF viewer for the published research.

## 🛠️ Installation & Usage
Because this project is built with vanilla HTML, CSS, and JavaScript, no build steps or heavy dependencies (like Node.js or Python) are required.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/intelligent-routing-crypto.git](https://github.com/yourusername/intelligent-routing-crypto.git)
