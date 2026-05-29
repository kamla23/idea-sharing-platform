import express from "express";
import dotenv from "dotenv";

dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import ideaRoutes from "./routes/idea.routes.js";



console.log("JWT_SECRET:", process.env.JWT_SECRET);


const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://192.168.10.89:5500", ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});