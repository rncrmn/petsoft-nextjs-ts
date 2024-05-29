"use client";

import { addPet, deletePet, editPet } from "@/actions/actions";
import { PetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client";
import { createContext, useOptimistic, useState } from "react";
import { toast } from "sonner";

type PetContextProviderProps = {
  data: Pet[];
  children: React.ReactNode;
};

type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet["id"] | null;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  handleAddPet: (newPet: PetEssentials) => Promise<void>;
  handleEditPet: (petId: Pet["id"], newPetData: PetEssentials) => Promise<void>;
  handleCheckoutPet: (petId: Pet["id"]) => Promise<void>;
  handleChangeSelectedPetId: (petId: Pet["id"]) => void;
};

export const PetContext = createContext<TPetContext | null>(null);

export default function PetContextProvider({
  data,
  children,
}: PetContextProviderProps) {
  // state
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [
            ...state,
            {
              ...payload,
              id: Math.random().toString(),
            },
          ];
        case "edit":
          return state.map((pet) => {
            if (pet.id === payload.id) {
              return {
                ...pet,
                ...payload.newPetData,
              };
            }
            return pet;
          });
        case "delete":
          return state.filter((pet) => pet.id != payload);
        default:
          state;
      }
    }
  );
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // derive state
  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  // event handlers
  const handleAddPet = async (newPet: PetEssentials) => {
    setOptimisticPets({
      action: "add",
      payload: newPet,
    });
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleEditPet = async (petId: Pet["id"], newPetData: PetEssentials) => {
    setOptimisticPets({
      action: "edit",
      payload: {
        id: petId,
        newPetData,
      },
    });
    const error = await editPet(petId, newPetData);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };
  const handleCheckoutPet = async (petId: Pet["id"]) => {
    setOptimisticPets({
      action: "delete",
      payload: petId,
    });
    await deletePet(petId);
    setSelectedPetId(null);
  };
  const handleChangeSelectedPetId = (petId: Pet["id"]) => {
    setSelectedPetId(petId);
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleAddPet,
        handleEditPet,
        handleCheckoutPet,
        handleChangeSelectedPetId,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
