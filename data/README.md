# Data

Directory layout:

```text
data/
├── raw/
│   ├── satellite/
│   ├── ais/
│   └── ocean/
├── processed/
│   ├── satellite/
│   ├── ais/
│   └── ocean/
└── sample/
    ├── satellite/
    ├── ais/
    └── ocean/
```

Do not commit large proprietary datasets, credentials, or model weights. Use `data/sample/` for small fixtures that are safe to redistribute.
