#!/bin/bash
# Script to auto-generate ISO 9126 feature mapping report

echo "Generating ISO 9126 Report..."

cat << EOF > docs/iso_9126_mapping.md
# ISO 9126 Feature Mapping

| Feature | Functionality | Reliability | Usability | Efficiency | Maintainability | Portability |
|---------|:-------------:|:-----------:|:---------:|:----------:|:---------------:|:-----------:|
| Login   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Signup  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ |   | ✓ | ✓ |

*Generated automatically.*
EOF

echo "ISO 9126 report generated at docs/iso_9126_mapping.md"
