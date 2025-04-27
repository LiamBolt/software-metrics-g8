import markdown

# Features and their corresponding ISO 9126 mappings
features_mapping = {
    "User Login": {
        "Functionality": "✓",
        "Reliability": "✓",
        "Usability": "✓",
        "Efficiency": "✓",
        "Maintainability": "✓",
        "Portability": "✓"
    },
    "Admin Dashboard": {
        "Functionality": "✓",
        "Reliability": "✓",
        "Usability": "✓",
        "Efficiency": "",
        "Maintainability": "✓",
        "Portability": "✓"
    },
    "API Integration": {
        "Functionality": "✓",
        "Reliability": "✓",
        "Usability": "",
        "Efficiency": "✓",
        "Maintainability": "✓",
        "Portability": "✓"
    }
}

# Define the header for the markdown file
header = """
# ISO 9126 Feature Mapping

This table maps the features of the system to the characteristics of the ISO 9126/25010 model.
"""

# Create the markdown content
markdown_content = header + "\n| Feature | Functionality | Reliability | Usability | Efficiency | Maintainability | Portability |\n|---------|:-------------:|:-----------:|:---------:|:----------:|:---------------:|:-----------:|\n"

# Populate the markdown content with feature mappings
for feature, mapping in features_mapping.items():
    markdown_content += f"| {feature} | {mapping['Functionality']} | {mapping['Reliability']} | {mapping['Usability']} | {mapping['Efficiency']} | {mapping['Maintainability']} | {mapping['Portability']} |\n"

# Save the content to a .md file
with open("iso_9126_mapping.md", "w") as file:
    file.write(markdown_content)

# Optionally convert the markdown to HTML (useful for rendering in a browser)
html_content = markdown.markdown(markdown_content)
with open("iso_9126_mapping.html", "w") as file:
    file.write(html_content)

print("Markdown and HTML files have been generated.")
