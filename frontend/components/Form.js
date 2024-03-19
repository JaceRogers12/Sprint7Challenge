import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios from "axios"

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const valuesSchema = yup.object().shape({
  fullName: yup.string()
    .required()
    .trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: yup.string()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]
const initialValues = {
  fullName: "",
  size: "",
  toppings: []
}

export default function Form() {
  let [values, setValues] = useState(initialValues);
  let [disabled, setDisabled] = useState(true);
  let [orderStatus, setOrderStatus] = useState("");
  let [errors, setErrors] = useState(initialValues);
  let [orderMessage, setOrderMessage] = useState("")

  const onSubmit = (event) => {
    event.preventDefault();
    axios.post("http://localhost:9009/api/order", values)
    .then(res => {
      console.log("GOOD:", res);
      setOrderStatus("success");
      setOrderMessage(res.data.message);
    })
    .catch(res => {
      console.log("BAD:", res);
      setOrderStatus("failure");
      setOrderMessage("Something went wrong");
    })
    .finally(() => {
      console.log(values);
      setValues(initialValues);
      setErrors(initialValues);
    })
  }

  const changeHandler = (event) => {
    let { value, id, type} = event.target;
    if (type == "checkbox") {
      if (values.toppings.includes(value)) {
        const newToppings = values.toppings.filter(item => item != value);
        setValues({...values, toppings: newToppings})
      }
      else {
        const newToppings = values.toppings.concat(value);
        setValues({...values, toppings: newToppings})
      }
    } else {
      setValues({...values, [id]: value})
    }
    yup.reach(valuesSchema, id)
      .validate(value)
        .then(() => setErrors({...errors, [id]: ""}))
        .catch(res => setErrors({...errors, [id]: res.errors[0]}))

  }

  useEffect(()=> {
    valuesSchema.isValid(values)
      .then(valid => setDisabled(!valid))
  }, [values]);

  return (
    <form onSubmit={event => onSubmit(event)}>
      <h2>Order Your Pizza</h2>
      {orderStatus == "success" && <div className='success'>{orderMessage}</div>}
      {orderStatus == "failure" && <div className='failure'>{orderMessage}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name"
            id="fullName"
            type="text"
            onChange={event =>
            changeHandler(event)}
            value={values.fullName}
          />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={event => changeHandler(event)} value={values.size}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => {
          return(
            <label key={topping.topping_id}>
              <input
                name={topping.text}
                value= {topping.topping_id}
                type="checkbox"
                onChange={event => changeHandler(event)}
                checked={!!values.toppings.includes(topping.topping_id)}
              />
              {topping.text}<br />
            </label>
          )})
        }
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={disabled}/>
    </form>
  )
}
