"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
type Project = {
  id: string;
  name: string;
  description: string;
  models: Model[];
};

type Api = {
  method: string;
  generate: boolean;
};

type Property = {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
};

type Model = {
  id: string;
  name: string;
  entityType: string;
  description: string;
  apis: Api[];
  properties: Property[];
  changed?: boolean;
};

export default function ModelManager({
  project,
  isDeploying,
}: {
  project: Project;
  isDeploying: boolean;
}) {
  const [models, setModels] = useState<Model[]>(project.models);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDesc, setNewModelDesc] = useState("");

  const addModel = async () => {
    if (!newModelName.trim()) return;

    const newModel = {
      name: newModelName.trim(),
      description: newModelDesc.trim(),
      properties: [],
    };

    const res = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/model/${project.id}`,
      {
        method: "POST",
        body: JSON.stringify(newModel),
      }
    );

    if (res.ok) {
      const responseData = await res.json();
      console.log(responseData);
      setModels((prev) => [...prev, responseData.data]);
      setNewModelName("");
      setNewModelDesc("");
    }
  };

  // Edit model fields
  const editModel = (
    id: string,
    field: keyof Pick<Model, "name" | "description">,
    value: string
  ) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: value, changed: true } : m
      )
    );
  };

  // Delete model
  const deleteModel = async (id: string) => {
    const res = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/model/${project.id}/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      setModels((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Toggle API generate
  const toggleApiGenerate = (modelId: string, method: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? {
              ...m,
              apis: m.apis.map((api) =>
                api.method === method
                  ? { ...api, generate: !api.generate }
                  : api
              ),
              changed: true,
            }
          : m
      )
    );
  };

  // Add property
  const addProperty = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? {
              ...m,
              properties: [
                ...m.properties,
                { name: "", type: "string", required: false },
              ],
              changed: true,
            }
          : m
      )
    );
  };

  // Edit property field
  const editProperty = (
    modelId: string,
    index: number,
    field: keyof Property,
    value: string | boolean
  ) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          const newProps = m.properties.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
          );
          return { ...m, properties: newProps, changed: true };
        }
        return m;
      })
    );
  };

  // Delete property
  const deleteProperty = async (modelId: string, index: number) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? {
              ...m,
              changed: true,
              properties: m.properties.filter((_, i) => i !== index),
            }
          : m
      )
    );
  };

  const pushModelUpdate = async (modelId: string) => {
    const model = models.find((x) => x.id === modelId);
    console.log(model);
    if (!model) return;
    const res = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/model/${project.id}/${modelId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: model.name,
          description: model.description,
          properties: [...model.properties],
        }),
      }
    );

    const res1 = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/model-api/${project.id}/${modelId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          apis: model.apis,
        }),
      }
    );

    if (res.ok && res1.ok) {
      const data = await res.json();
      console.log(data);
      alert("Model saved");

      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? {
                ...m,
                changed: false,
              }
            : m
        )
      );
    }
  };

  const redeployChanges = async () => {
    const res = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/deployment`,
      {
        method: "PUT",
        body: JSON.stringify({
          projectId: project.id,
        }),
      }
    );

    if (res.ok) {
      alert("Redeployment in progress... Check log out");
      const router = useRouter();
      router.refresh();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
      <section className="border p-4 rounded shadow space-y-4 bg-gray-900">
        <h2 className="text-xl font-semibold">Add New Model</h2>
        <input
          type="text"
          placeholder="Model name"
          value={newModelName}
          onChange={(e) => setNewModelName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <textarea
          placeholder="Description (optional)"
          value={newModelDesc}
          onChange={(e) => setNewModelDesc(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
        <button
          onClick={addModel}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!newModelName.trim()}
        >
          Add Model
        </button>
      </section>

      <section className="space-y-6">
        {models.map((model) => (
          <div
            key={model.id}
            className="border rounded p-4 shadow bg-gray-900 space-y-4"
          >
            {/* Model Header: name + description + delete */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-col md:flex-row md:gap-4 md:items-center flex-1">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => editModel(model.id, "name", e.target.value)}
                  className="font-semibold text-lg border-b focus:outline-none flex-1"
                  placeholder="Model Name"
                />
                <input
                  type="text"
                  value={model.description}
                  onChange={(e) =>
                    editModel(model.id, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="border rounded px-2 py-1 flex-1 max-w-md"
                />
              </div>
              <button
                onClick={() => deleteModel(model.id)}
                className="text-red-600 hover:underline self-start md:self-auto"
                title="Delete model"
              >
                Delete Model
              </button>
            </div>

            {/* APIs Section */}
            <div>
              <h3 className="font-semibold mb-2">APIs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {model.apis.map((api) => (
                  <label
                    key={api.method}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={api.generate}
                      onChange={() => toggleApiGenerate(model.id, api.method)}
                      className="cursor-pointer"
                    />
                    <span className="capitalize">{api.method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <h3 className="font-semibold mb-2">Properties</h3>
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="border border-gray-300 px-2 py-1">Name</th>
                    <th className="border border-gray-300 px-2 py-1">Type</th>
                    <th className="border border-gray-300 px-2 py-1">
                      Required
                    </th>
                    <th className="border border-gray-300 px-2 py-1">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {model.properties.map((prop, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={prop.name}
                          onChange={(e) =>
                            editProperty(model.id, idx, "name", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                          placeholder="Property name"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <select
                          value={prop.type}
                          onChange={(e) =>
                            editProperty(
                              model.id,
                              idx,
                              "type",
                              e.target.value as Property["type"]
                            )
                          }
                          className="w-full border rounded px-1 py-0.5"
                        >
                          <option value="string">string</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={prop.required}
                          onChange={(e) =>
                            editProperty(
                              model.id,
                              idx,
                              "required",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <button
                          onClick={() => deleteProperty(model.id, idx)}
                          className="text-red-600 hover:underline"
                          title="Delete property"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {model.properties.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-500 py-2"
                      >
                        No properties defined.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between">
                <button
                  onClick={() => addProperty(model.id)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex-start"
                >
                  + Add Property
                </button>

                <button
                  onClick={() => pushModelUpdate(model.id)}
                  disabled={!model.changed}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-green-700 flex-end"
                >
                  Push Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="flex justify-center gap-38">
        <button
          onClick={() => redeployChanges()}
          disabled={isDeploying}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-green-700 flex-end"
        >
          Deploy changes
        </button>
      </section>
    </div>
  );
}
