from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
import os
from dotenv import load_dotenv  # Importar

load_dotenv() # Carregar variáveis do .env

# Configuração do Supabase (Lê variáveis do ambiente Vercel)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    # Fallback para ambiente local/dev ou erro
    supabase = None

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Mentor(BaseModel):
    id: int
    name: str
    subject: str
    price: float
    bio: str
    verified: bool
    rating: float
    image_url: str

@app.get("/api/mentors", response_model=list[Mentor])
def get_mentors(subject: str = None, verified: bool = None, max_price: float = None):
    if not supabase:
        return []

    query = supabase.table("mentors").select("*")

    if subject:
        query = query.ilike("subject", f"%{subject}%")

    if verified is not None:
        query = query.eq("verified", verified)

    if max_price:
        query = query.lte("price", max_price)

    response = query.execute()
    return response.data

@app.get("/api/mentors/{mentor_id}", response_model=Mentor)
def get_mentor_by_id(mentor_id: int):
    if not supabase:
        return {}

    response = supabase.table("mentors").select("*").eq("id", mentor_id).single().execute()
    return response.data
