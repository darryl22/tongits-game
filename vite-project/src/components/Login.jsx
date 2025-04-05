import React, {useEffect, useState  } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios"
import "./auth.css"

function Login() {
    let [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [redirectTo, setRedirectTo] = useState([false, ""])
    if (redirectTo[0] === true) {
        return <Navigate to={redirectTo[1]}/>
    }
    function hamdleChange(e) {
        const name = e.target.name
        const value = e.target.value
        setFormData(prev => {
            return {...prev, [name]: value}
        })
    }

    function handleSubmit(e) {
        e.preventDefault()
        console.log(formData)
        axios.post("http://localhost:3002/login",{data: formData}, {withCredentials: "true"})
        .then(res => {
            console.log(res.data)
            if (res.data.error) {
                setError(res.data.error)
            } else {
                setRedirectTo([true, "/"])
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    return (
        <div>
            <h1 style={{textAlign: "center"}}>Login</h1>
            <form action="" className="auth-form" onSubmit={handleSubmit}>
                <p>{error}</p>
                <label htmlFor="username">Username</label>
                <input type="text" name="username" value={formData.username} className="auth-input" onChange={hamdleChange}/>

                <label htmlFor="password">Password</label>
                <input type="text" name="password" value={formData.password} className="auth-input" onChange={hamdleChange}/>

                <button>Submit</button>
            </form>
        </div>
    )
}

export default Login