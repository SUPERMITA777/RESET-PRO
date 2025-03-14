import React, { useState } from 'react';
import './Settings.css'; // Asegúrate de crear este archivo CSS

function Settings() {
    const [logo, setLogo] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [isChanged, setIsChanged] = useState(false);

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        setLogo(file);
        setLogoUrl(URL.createObjectURL(file)); // Crear una URL para el archivo
        setIsChanged(true); // Indica que ha habido un cambio
    };

    const handleSave = () => {
        // Lógica para guardar el logo
        // Aquí deberías implementar la lógica para subir el logo al servidor
        // ...
        setIsChanged(false); // Resetea el estado de cambio después de guardar
    };

    return (
        <div className="settings-container">
            <h1>Configuración</h1>
            <input type="file" onChange={handleLogoChange} className="file-input" />
            <button onClick={handleSave} disabled={!isChanged} className="save-button">
                Guardar
            </button>
            {logoUrl && (
                <div className="logo-preview">
                    <img src={logoUrl} alt="Logo" className="logo-image" />
                </div>
            )}
        </div>
    );
}

export default Settings; 