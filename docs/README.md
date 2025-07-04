---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: eYY-3yp-project-template
title: VascuEye - A Real-Time Blood Flow Monitoring System
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# VescuEye

---

## Team
-  E/20/248, T.L.B Mapagedara, [email](mailto:e2024@eng.pdn.ac.lk)
-  E/20/158, J.G.C Jananga, [email](mailto:e2024@eng.pdn.ac.lk)
-  E/20/453, R.J Yogesh, [email](mailto:e2024@eng.pdn.ac.lk)
-  E/20/300, H.A.M.T Prasadinie, [email](mailto:e2024@eng.pdn.ac.lk)

-  --

## Supervisor
- Dr. Isuru Nawinne, [email](mailto:isurunawinne@eng.pdn.ac.lk)

- --
## Introduction Video

[Watch Video](./videos/intro.mp4)


---
## Hardware Setup

![Hardware Setup](./images/hardware_setup.jpg)

---

## Image Enhance Process

![Enhanced Image Sample](./images/enhanced_image.jpg)

---

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Hardware & Software Designs](#hardware-and-software-designs)
4. [Web & Mobile Applications](#web-and-mobile-applications)
5. [Testing](#testing)
6. [Detailed Budget](#detailed-budget)
7. [Conclusion](#conclusion)
8. [Links](#links)

---

## Introduction

VascuEye is a medical imaging system that utilizes near-infrared (NIR) technology to detect arteries and assist in both preoperative planning and post-surgical inspection for oral and facial surgeries. By providing real-time visualization of blood vessels, the system helps surgeons avoid accidental arterial damage and simplifies post-surgical monitoring to detect complications like hematomas or poor blood circulation.

---

### Applications & Benefits
- ✅ **Enhanced Surgical Accuracy** – Helps avoid arterial damage during procedures.
- ✅ **Faster & Easier Post-Surgical Inspection** – Reduces reliance on manual monitoring.
- ✅ **Real-Time Blood Flow Monitoring** – Detects complications early.
- ✅ **Portable & Affordable Solution** – More accessible than high-end imaging devices.
- ✅ **Remote Monitoring Support** – Enables telemedicine and second opinions.

- --

## Solution Architecture

![Solution Architecture](./images/3YP-Page.png)

---

## Hardware and Software Designs

### Hardware Components
- **Raspberry Pi NoIR V2 Camera** – Captures near-infrared images of veins.
- **MLX90614 Temperature Sensor** – Measures skin surface temperature for patient monitoring.
- **IR LEDs (850nm, 940nm)** – Enhances vein visibility under NIR light.
- **Raspberry Pi 3 Model B** – Processes the images and runs the web interface.
- **LCD Display** – Displays real-time feedback.
- **Power Bank** – Ensures portable operation.

### Software Stack
- **Backend:** Node.js, Express.js, MongoDB
- **Frontend:** React, Tailwind CSS
- **Mobile App:** React Native, Expo
- **Image Processing:** OpenCV, TensorFlow

## Web & Mobile Applications

### Web Application
- **Built with React and Node.js** to provide a user-friendly dashboard for doctors.
- **User Roles:**
  - **Doctors** can monitor patients and view real-time vein images.
  - **Hospitals** can register doctors and assign patients.
  - **Patients** can access their reports and track their recovery.
- **Authentication & Security:** JWT-based authentication ensures secure access.
- **Data Storage:** MongoDB is used for storing patient data and image records.

### Mobile Application
- **Developed using React Native & Expo** for cross-platform support.
- **Features:**
  - Real-time blood flow monitoring via mobile.
  - Secure login and role-based access.
  - Push notifications for critical alerts.
  - Integration with the web dashboard for patient tracking.
- **Notifications:** Firebase Cloud Messaging (FCM) for mobile alerts.

- --

## Testing

Comprehensive testing on both **hardware** and **software** components:
- **Hardware Testing:** Accuracy of temperature readings, infrared imaging performance.
- **Software Testing:** Web & mobile application functionality, security, and performance.
- **Usability Testing:** Evaluation with medical professionals for feedback.

- --

## Detailed Budget

All items and costs

| Item                            | Quantity | Unit Cost   | Total     |
|---------------------------------|:--------:|:-----------:|----------:|
| Temperature Sensor (MLX90614)   | 1        | Rs. 4500.00 | Rs. 4500.00|
| Raspberry Pi 3 Model B          | 1        | Rs. 20400.00| Rs. 20400.00|
| Raspberry Pi NoIR Camera Sony IMX219 | 1   | Rs. 7200.00 | Rs. 7200.00|
| IR LEDs (850nm)                 | 10       | Rs. 200.00  | Rs. 2000.00|
| IR LEDs (940nm)                 | 10       | Rs. 200.00  | Rs. 2000.00|
| 5 Inch LCD Display              | 1        | Rs. 10500.00| Rs. 10500.00|
| Wires and Other Electronic Components | -    | Rs. 1000.00 | Rs. 1000.00|
| Power Bank (10000 mAh)          | 1        | Rs. 2500.00 | Rs. 2500.00|
| **Total Price**                 |          |             | **Rs. 47400.00**|


---

## Conclusion

VascuEye successfully integrates **hardware-based vein visualization** with **web and mobile applications**, enabling efficient real-time monitoring of blood circulation. Future improvements may include:
- AI-based vein detection and segmentation.
- Enhanced thermal imaging for deeper tissue analysis.
- Cloud-based patient data storage for seamless access.

- --

## Links

- [Project Repository](https://github.com/cepdnaclk/e20-3yp-Vascueye ){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/e20-3yp-Vascueye){:target="_blank"}
- [Hardware Setup Image](./images/hardware_setup.jpg)
- [Enhanced Image Sample](./images/enhanced_image.jpg)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

