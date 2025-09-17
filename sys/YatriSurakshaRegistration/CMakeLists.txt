cmake_minimum_required(VERSION 3.16)

# Set the project name
project(YatriSurakshaRegistration VERSION 1.0)

# Set the C++ standard to a modern version
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find the required Qt components
find_package(Qt6 REQUIRED COMPONENTS Widgets Network)

# Enable automatic handling of UI files, resources, and moc files
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOMOC ON)

# Define the executable target and list all source files
add_executable(${PROJECT_NAME}
    main.cpp
    mainwindow.cpp
    qrcodegen.cpp
    mainwindow.ui # List the UI file here
)

# Link the target with the required Qt libraries
target_link_libraries(${PROJECT_NAME} PRIVATE
    Qt6::Widgets
    Qt6::Network
)
