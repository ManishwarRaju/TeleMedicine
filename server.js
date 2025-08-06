const express=require("express")
const cors=require("cors")

const app=express();
app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("started");
})

app.listen(8000,()=>{
    console.log("listening to the song monica")    
})

