def generate_iso9126_report():
    print("Generating ISO 9126 Report...")

    # Define the content for the report
    report_content = """# ISO 9126 Feature Mapping

| Feature  | Functionality | Reliability | Usability | Efficiency | Maintainability | Portability |
|----------|:-------------:|:-----------:|:---------:|:----------:|:---------------:|:-----------:|
| Login    | ✓             | ✓           | ✓         | ✓          | ✓               | ✓           |
| Signup   | ✓             | ✓           | ✓         | ✓          | ✓               | ✓           |
| Dashboard| ✓             | ✓           | ✓         |            | ✓               | ✓           |

*Generated automatically.*
"""

    # Write the content to the file
    with open("docs/iso_9126_mapping.md", "w") as file:
        file.write(report_content)

    print("ISO 9126 report generated at docs/iso_9126_mapping.md")

# Run the function to generate the report
if __name__ == "__main__":
    generate_iso9126_report()
