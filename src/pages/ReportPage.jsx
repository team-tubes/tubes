import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContextProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidate, toFormikValidationSchema } from "zod-formik-adapter";

const schema = z.object({
  fname: z.string({
    required_error: "Please enter your first name",
  }),
  lname: z.string({
    required_error: "Please enter your last name",
  }),
  email: z
    .string({
      required_error: "Please enter your email",
    })
    .email({
      message: "Invalid email",
    }),
  lat: z.number({
    required_error: "Please specify a latitude",
  }),
  lng: z.number({
    required_error: "Please specify a longitude",
  }),
  description: z.string({
    required_error: "Please describe the issue",
  }),
  address: z.string().optional(),
  phone_country: z.number().optional(),
  phone: z.number().optional(),
});

export default function ReportPage() {
  const { issues, loading } = useContext(AppContext);
  const [query, setQuery] = useState("");

  const [lat, setLat] = useState();
  const [lng, setLng] = useState();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    },
    () => {
      setLat("set");
      setLng("set");
    }
  );

  if (loading || !lat || !lng) return <div>loading...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="px-6  flex justify-center flex-col items-center w-full">
        <div className="h-12" />
        <div className="md:mb-2">
          <div className="flex flex-col items-start  rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
            <h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200">
              Submit issue
            </h6>
            <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <div className="my-2">
              <Formik
                validate={toFormikValidate(schema)}
                initialValues={{
                  lat: lat != "set" ? lat : undefined,
                  lng: lng != "set" ? lng : lng,
                }}
                onSubmit={async (values) => {
                  let data = new URLSearchParams(values);

                  let resp = await fetch(
                    "https://api.infra.nz/api/complaints",
                    {
                      method: "POST",
                      headers: {
                        "content-type": "application/x-www-form-urlencoded",
                      },
                      body: data,
                    }
                  );

                  if (resp.status != 200) {
                    alert("Error submitting form " + (await resp.text()));
                  } else {
                    alert("Success");
                  }

                  console.log(values);
                }}
              >
                <Form>
                  <div className="grid lg:grid-cols-2 gap-x-10 my-2">
                    <label
                      htmlFor="fname"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      First Name
                    </label>

                    <Field
                      type="text"
                      id="fname"
                      name="fname"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      placeholder=""
                      required
                    />

                    <label
                      htmlFor="lname"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      Last Name
                    </label>
                    <Field
                      type="text"
                      id="lname"
                      name="lname"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      placeholder=""
                      required
                    />
                  </div>
                  <ErrorMessage name="fname" component="div" />
                  <ErrorMessage name="lname" component="div" />

                  <div className="h-8"></div>
                  <label
                    className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                    placeholder="example@example.com"
                    required
                  />
                  <ErrorMessage name="email" component="div" />

                  <div className="h-8"></div>
                  <label
                    className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <Field
                    type="text"
                    id="address"
                    name="address"
                    className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                    placeholder="E.g. 27D Te Waerenga Rd, Hamurana Springs	"
                    required
                  />
                  <ErrorMessage name="address" component="div" />

                  <div className="h-8"></div>
                  <div className="grid lg:grid-cols-[15%_75%] gap-x-10">
                    <label
                      htmlFor="country"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      Country
                    </label>

                    <Field
                      type="number"
                      id="country"
                      name="phone_country"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      value="64"
                    />

                    <label
                      htmlFor="phone"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      Phone number
                    </label>
                    <Field
                      type="number"
                      id="phone"
                      name="phone"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      placeholder=""
                    />
                  </div>
                  <ErrorMessage name="phone" component="div" />
                  <ErrorMessage name="phone_country" component="div" />

                  <div className="h-8"></div>
                  <div className="grid lg:grid-cols-2 gap-x-10">
                    <label
                      htmlFor="lat"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      Latitude
                    </label>

                    <Field
                      type="numebr"
                      id="lat"
                      name="lat"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      placeholder=""
                      required
                    />

                    <label
                      htmlFor="lng"
                      className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                    >
                      Longitude
                    </label>
                    <Field
                      type="number"
                      id="lng"
                      name="lng"
                      className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                      placeholder=""
                      required
                    />
                  </div>
                  <ErrorMessage name="lng" component="div" />
                  <ErrorMessage name="lat" component="div" />

                  <div className="h-8"></div>
                  <label
                    className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Field
                    type="text"
                    id="description"
                    name="description"
                    className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                    placeholder="The water is not working"
                    required
                  />
                  <ErrorMessage name="description" component="div" />

                  <button
                    type="submit"
                    className="px-4 py-3 mt-6 m-0 ml-auto self-end bg-purple-200 text-neutral-700 block w-auto rounded-md"
                  >
                    Submit
                  </button>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
