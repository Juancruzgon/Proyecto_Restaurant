import os
from fastapi import FastAPI, Depends, HTTPException
from database import get_session
from sqlmodel import Session, select
from models.usuario import Usuario
from auth import verificar_password, crear_token
from fastapi.security import OAuth2PasswordRequestForm 
from websocket_manager import manager
from fastapi import WebSocket
from routers import producto, usuario, mesa, categoria_producto, categoria_gasto, gasto, insumo, salon, categoria_insumo, insumo, pedido, rol, promocion
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(pedido.router)
app.include_router(producto.router)
app.include_router(usuario.router)
app.include_router(mesa.router)
app.include_router(rol.router)
app.include_router(categoria_producto.router)
app.include_router(categoria_gasto.router)
app.include_router(gasto.router)
app.include_router(insumo.router)
app.include_router(salon.router)
app.include_router(categoria_insumo.router)
app.include_router(insumo.router)
app.include_router(promocion.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except:
        manager.disconnect(websocket)


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    usuario = session.exec(select(Usuario).where(Usuario.email == form_data.username)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if not verificar_password(form_data.password, usuario.password):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    token = crear_token({"sub": usuario.email})
    return {
        "access_token": token, 
        "token_type": "bearer",
        "rol_id": usuario.rol_id,
        "nombre": usuario.nombre
    }
