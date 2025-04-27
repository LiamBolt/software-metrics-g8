#!/usr/bin/env python3
"""
Feedback Collection Script for Primary School Homework Portal
This script collects user feedback via terminal input and stores it in a text file.
"""

import os
import time
import datetime
import json
from pathlib import Path

class FeedbackCollector:
    def __init__(self):
        # Set up paths
        self.script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        self.project_root = self.script_dir.parent
        self.metrics_dir = self.project_root / "metrics"
        self.feedback_file = self.metrics_dir / "user_feedback.txt"
        
        # Create metrics directory if it doesn't exist
        os.makedirs(self.metrics_dir, exist_ok=True)
        
        # Analytics data
        self.start_time = time.time()
        self.interaction_log = []
        
    def log_interaction(self, event_type, details=None):
        """Record user interaction with timestamp"""
        self.interaction_log.append({
            "timestamp": time.time() - self.start_time,
            "event": event_type,
            "details": details
        })
    
    def get_input(self, prompt, input_type="text", options=None):
        """Get user input with interaction logging"""
        print(prompt)
        start_time = time.time()
        
        if options:
            for idx, option in enumerate(options, 1):
                print(f"{idx}. {option}")
            
            while True:
                try:
                    choice = int(input("> "))
                    if 1 <= choice <= len(options):
                        response = options[choice-1]
                        break
                    else:
                        print(f"Please enter a number between 1 and {len(options)}")
                except ValueError:
                    print("Please enter a valid number")
        
        elif input_type == "rating":
            while True:
                response = input("> ")
                try:
                    rating = int(response)
                    if 1 <= rating <= 5:
                        break
                    else:
                        print("Please enter a rating between 1 and 5")
                except ValueError:
                    print("Please enter a valid number")
        
        else:  # Regular text input
            response = input("> ")
        
        # Log the interaction
        self.log_interaction("input", {
            "prompt": prompt,
            "response_time": time.time() - start_time,
            "input_type": input_type
        })
        
        return response
    
    def collect_feedback(self):
        """Collect feedback from the user"""
        print("\n" + "="*50)
        print("   PRIMARY SCHOOL HOMEWORK PORTAL FEEDBACK FORM")
        print("="*50 + "\n")
        print("Thank you for taking the time to provide feedback!")
        print("This will help us improve the Homework Portal.\n")
        
        # Collect user information
        name = self.get_input("Please enter your name:")
        email = self.get_input("Please enter your email address:")
        role = self.get_input("Please select your role:", 
                             options=["Teacher", "Parent", "Administrator", "Student"])
        
        print("\nOn a scale of 1-5, how would you rate your experience with the portal?")
        print("(1 = Very Poor, 2 = Poor, 3 = Average, 4 = Good, 5 = Excellent)")
        rating = self.get_input("Your rating:", input_type="rating")
        
        print("\nPlease provide any additional comments or suggestions:")
        comments = self.get_input("Your feedback:")
        
        # Create feedback data
        feedback_data = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "name": name,
            "email": email,
            "role": role,
            "rating": int(rating),
            "comments": comments,
            "analytics": {
                "total_time": time.time() - self.start_time,
                "interactions": self.interaction_log
            }
        }
        
        return feedback_data
    
    def save_feedback(self, feedback_data):
        """Save feedback to file"""
        try:
            # Create the file if it doesn't exist
            if not os.path.exists(self.feedback_file):
                with open(self.feedback_file, 'w') as f:
                    f.write("# Primary School Homework Portal - User Feedback Log\n\n")
            
            # Append the new feedback
            with open(self.feedback_file, 'a') as f:
                f.write(f"\n--- Feedback Entry: {feedback_data['timestamp']} ---\n")
                f.write(f"Name: {feedback_data['name']}\n")
                f.write(f"Email: {feedback_data['email']}\n")
                f.write(f"Role: {feedback_data['role']}\n")
                f.write(f"Rating: {feedback_data['rating']}/5\n")
                f.write(f"Comments: {feedback_data['comments']}\n")
                f.write(f"Session Duration: {feedback_data['analytics']['total_time']:.2f} seconds\n")
                
            # Save detailed analytics to a separate JSON file
            analytics_file = self.metrics_dir / f"analytics_{int(time.time())}.json"
            with open(analytics_file, 'w') as f:
                json.dump(feedback_data, f, indent=2)
                
            return True
        except Exception as e:
            print(f"Error saving feedback: {e}")
            return False

def main():
    feedback_collector = FeedbackCollector()
    
    try:
        feedback_data = feedback_collector.collect_feedback()
        
        print("\nSubmitting your feedback...")
        time.sleep(1)
        
        success = feedback_collector.save_feedback(feedback_data)
        
        if success:
            print("\n✓ Thank you! Your feedback has been successfully submitted.")
            print("Your input helps us improve the Primary School Homework Portal.")
        else:
            print("\n✗ There was an error submitting your feedback. Please try again later.")
    
    except KeyboardInterrupt:
        print("\n\nFeedback collection cancelled. Thank you for your time!")
    except Exception as e:
        print(f"\n\nAn unexpected error occurred: {e}")
    
    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    main()
