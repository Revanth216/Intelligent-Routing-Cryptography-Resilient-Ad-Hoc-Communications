# Intelligent Routing & Cryptography for Resilient Ad-Hoc Communications

<div align="center">

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)

</div>

An interactive, web-based simulation demonstrating secure data transmission in mobile ad-hoc networks (MANETs). This project visualizes the vulnerabilities of traditional routing protocols to wormhole attacks and implements a robust mitigation strategy using **Dijkstra's Algorithm** and the **Schnorr Signature Protocol**.

## 🚀 Live Demo
**[Experience the Simulation Here](https://revanth216.github.io/adhoc/)**

## 📖 Project Overview
Ad-hoc networks dynamically form connections without relying on fixed infrastructure, making them ideal for disaster recovery and military deployments. However, this flexibility makes them highly susceptible to cyberattacks at the routing layer, particularly **wormhole attacks**.

This simulation provides a side-by-side comparison of:
1. **Existing Random Routing:** A probabilistic approach that is inefficient, resource-heavy, and easily compromised by malicious nodes.
2. **Proposed Secure Routing:** A dynamic approach that calculates the optimal path using Dijkstra's algorithm and secures the payload using lightweight Schnorr cryptographic authentication.

## ✨ Key Features
* **Dynamic Network Generation:** Procedurally generates nodes based on proximity and communication capacity.
* **Wormhole Attack Simulation:** Injects anomalous distant links to demonstrate how traditional random walks can be hijacked.
* **Signature Verification Protocol:** Validates node authenticity and physical radio thresholds to isolate compromised edges before transmission.
* **Real-time Data Visualization:** Includes an animated system log and a dynamically generated Packet Delivery Ratio (PDR) graph comparing both methodologies.
* **Modern UI/UX:** Features a responsive layout with an integrated Light/Dark mode toggle and a built-in PDF viewer for the published research.

## 🛠️ Getting Started
To run this project locally, simply clone the repository and open the main HTML file in your browser:

```bash
git clone [https://github.com/revanth216/adhoc.git](https://github.com/revanth216/adhoc.git)
cd adhoc
# Open index.html in your preferred web browser
