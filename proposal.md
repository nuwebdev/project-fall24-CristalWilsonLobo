# CS5610 Web Development Project: MBTA Tracker Insights
### Project Goal
The objective of this project is to create an MBTA Tracker Dashboard that provides real-time insights into the operations and routes of MBTA trains.  
<BR>
This dashboard will display train routes, active train locations, and stops on an interactive map.
<BR>
The aim is to provide commuters, and MBTA administrators with comprehensive, up-to-date data to enhance travel planning, monitor train operations, and support future transit optimization.

<BR>

### Functionality
#### Route Visualization
Interactive map visualization displaying MBTA train routes (Green, Red, Orange, Blue lines, and Commuter Rail). Each route will be color-coded for better distinction.

#### Active Train Overview
Display real-time locations of active trains on selected routes. Each train marker will include detailed information about the train’s current status (e.g., in transit, arriving, stopped).

#### Stop Representation
Train stops will be represented as small white circles on the map, with tooltips showing stop names when hovered over.

#### Train and Route Insights
Detailed sidebar displaying current train information, such as train number, direction, current status, and estimated arrival times at the next stop.

<BR>

### User Stories 
#### User Story 1: Commuter
View real-time train locations and routes on the map to plan my commute effectively. Check the list of active trains and their current statuses to make informed travel decisions.
Access detailed information about train routes and stops to explore the MBTA transit system. View train movement on the map and analyze routes for interest or educational purposes.
#### User Story 2: MBTA Administrator
Monitor active train statuses and their adherence to schedules in real-time. Analyze train and route data to improve service and make data-driven decisions for operational enhancements.
<BR>

### UI design
### I Main Page Structure
####  MBTA Map with Routes and Trains
The homepage will feature an interactive map showing various MBTA train routes. The map will be the central feature, and users can view routes represented by colored lines, stops as white circles, and active trains as circular markers with detailed information. This map will provide a real-time visualization to aid in commuting and transit analysis.

### II Sidebar
#### List of Active Trains
The sidebar on the main page will display a list of active trains on all selected routes. Each entry will provide details such as train number, current status (e.g., stopped, arriving, in transit), and the next station.

### III Navigation Bar
The navigation bar will allow users to switch between different views:
<ul>
<li>Routes: Shows detailed train routes and stops.</li>
<li>Active Trains: Lists all currently active trains and their real-time data.</li>
<li>Insights: Provides historical and analytical data for MBTA routes and train operations.</li>
</ul>

### IV Pop-up Details for Stops and Trains
Hovering or clicking on a stop or train marker on the map will display a pop-up window with information such as:
<ul>
<li> Stops: Stop name and route details.</li>
<li> Trains: Train number, current status, and estimated time until arrival at the next station.</li>
</ul>
<BR>

### Project Requirements
#### Back End
MapLibre will be used to manage API requests, data processing and displaying train routes on an interative map
#### Web API
The application will use the MBTA V3 API to gather data on:
<ul>
<li>Real-time vehicle locations ( via the vehicles API ) </li>
<li> Route details (via the shapes API) </li>
<li> Train stops (via the stops API) </li> 


#### Data
The project will leverage the MBTA V3 API to collect real-time and prediction related data:  
<ul>
<li>Real-Time Data: To display active trains, routes, and stops.
<li>Historical Data: To generate insights into train operations and route usage.
</ul>
This data will be used for generating heatmaps, route insights, and analytical reports. 

<br>

#### User/Admin Views
### Commuter Views:
Commuters will be able to access the map to see real-time data on train locations, routes, and stops. They can also view train details from the sidebar for planning their travel.
### Administrator Views: 
MBTA administrators will have additional access to analytical data for operational monitoring and decision-making. This view will include route and train status insights to help optimize service.