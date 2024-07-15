"use client";

import { Button, Typography } from "@mui/material";
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { toast } from "mui-sonner";
import { useConfirm } from "material-ui-confirm";

import { buildFavoriteFoodsQuery, Food } from "@/api/nutrition";
import SearchFoods from "@/components/nutrition/food/food-search";
import {
  buildAddFavoriteFoodsMutation,
  buildDeleteFavoritesFoodMutation,
} from "@/api/nutrition/foods";
import { FooterActionBar } from "@/components/layout/rows";
import { FormRow } from "@/components/forms/form-row";

const favoriteFoodsColumns: Array<GridColDef<Food>> = [
  { field: "name", headerName: "Food", flex: 2 },
  { field: "brand", headerName: "Brand", flex: 1 },
  {
    field: "accessLevel",
    headerName: "Type",
    valueFormatter: (accessLevel) =>
      accessLevel === "PRIVATE" ? "Custom" : "Public",
  },
];

export default function ManageFavoriteFoods() {
  const confirm = useConfirm();
  const [selectedRows, setSelectedRows] = useState<Array<number>>([]);

  const queryClient = useQueryClient();
  const { data: favoriteFoods } = useQuery(buildFavoriteFoodsQuery());

  const { mutateAsync: addFavoriteFoodIds } = useMutation(
    buildAddFavoriteFoodsMutation(queryClient)
  );

  const { mutateAsync: deleteFavoriteFoodIds } = useMutation(
    buildDeleteFavoritesFoodMutation(queryClient)
  );

  const addFavoriteFood = useCallback(
    (food: Food) => {
      addFavoriteFoodIds([food.foodId]).then(() => {
        toast.success("Added food to favorites list");
      });
    },
    [addFavoriteFoodIds]
  );

  const deleteFavorites = useCallback(() => {
    (async () => {
      await confirm({
        title: "Remove favorite foods?",
      });

      await deleteFavoriteFoodIds(selectedRows);
      toast.success("Removed foods from favorites list");
    })();
  }, [deleteFavoriteFoodIds, selectedRows, confirm]);

  return (
    <>
      <Typography variant="h5" className="m-4">
        Favorite foods
      </Typography>
      <div className="m-4">
        <AddFoodPicker addFood={addFavoriteFood} />
      </div>
      <DataGrid<Food>
        className="w-full"
        loading={!favoriteFoods}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={(rows) => {
          setSelectedRows(rows as Array<number>);
        }}
        checkboxSelection
        getRowId={(food) => food.foodId}
        rows={favoriteFoods}
        columns={favoriteFoodsColumns}
      />
      <FooterActionBar>
        <Button
          color="warning"
          disabled={selectedRows.length === 0}
          onClick={deleteFavorites}
        >
          Remove favorites
        </Button>
      </FooterActionBar>
    </>
  );
}

function AddFoodPicker({ addFood }: { addFood: (food: Food) => void }) {
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState<Food | null>(null);

  const addSelectedFood = useCallback(() => {
    if (selectedFoodToAdd) {
      addFood(selectedFoodToAdd);
    }
  }, [selectedFoodToAdd, addFood]);

  return (
    <FormRow>
      <SearchFoods
        className="flex-1"
        value={selectedFoodToAdd}
        onChange={setSelectedFoodToAdd}
      />
      <Button disabled={!selectedFoodToAdd} onClick={addSelectedFood}>
        Add favorite food
      </Button>
    </FormRow>
  );
}
