# VascuEye

**VascuEye** is a medical device system designed to assist oral surgeons during **free-flap oral surgery** by detecting arteries and monitoring blood flow in real time. Using **near-infrared (NIR) imaging technology**, VascuEye enhances surgical precision by visualizing subcutaneous arteries, reducing the risk of accidental arterial damage. The system also simplifies post-surgical monitoring by detecting complications like hematomas and poor blood circulation.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
  - [Embedded System](#embedded-system)
  - [Cloud & Server](#cloud--server)
  - [User Interface](#user-interface)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

VascuEye uses a **Raspberry Pi** embedded system with **NIR sensors** for artery detection, integrating **AWS IoT** for cloud storage and remote monitoring. The system features real-time artery mapping, displayed on a **mobile interface** developed using **Flutter**. This solution is tailored for **free-flap oral surgery**, where precise artery detection is critical to ensure the success of the procedure.

### Key Features:
- Real-time artery detection using **NIR technology**
- Post-surgical monitoring for complications like poor circulation and hematomas
- Cloud storage and secure remote data access via **AWS IoT**
- **Flutter**-based mobile application for easy monitoring

## Technology Stack

### Embedded System
- **Raspberry Pi 3B/4B**: Chosen for its processing power and flexibility.
- **NIR Sensors**: Sensors for detecting blood vessels (still under testing for optimal selection).

### Cloud & Server
- **AWS IoT**: Secure cloud storage and real-time data monitoring.
- **Node.js**: Backend server for data handling and transmission between hardware and cloud.
- **MongoDB**: NoSQL database for storing patient-specific artery images and analysis results.

### User Interface
- **React**: Cross-platform development framework for mobile apps to display post-surgical data.

## Getting Started

Follow these steps to set up your local development environment:

### Prerequisites:
- **Raspberry Pi** (3B/4B) with Raspbian OS
- **AWS Account** (for AWS IoT setup)
- **Node.js** and **MongoDB** installed locally for backend development

### Installation Steps:
1. **Clone the repository:**
   ```bash
   git clone https://github.com/cepdnaclk/e20-3yp-Vascueye.git
  
