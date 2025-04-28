from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task
    def index_page(self):
        # Simulate a GET request to the root endpoint
        self.client.get("/")

    @task
    def about_page(self):
        # Simulate a GET request to the /about endpoint
        self.client.get("/about")

    @task
    def contact_page(self):
        # Simulate a GET request to the /contact endpoint
        self.client.get("/contact")

class WebsiteUser(HttpUser):
    # Define the behavior of the user
    tasks = [UserBehavior]
    
    # Wait time between tasks (in seconds)
    wait_time = between(1, 5)
    
    # Specify the base URL of the web application
    host = "http://localhost:8000"  # Replace with your web app's URL