import { Box, Card, CardContent, Divider } from "@mui/material";
import moment from "moment";

export const Comments = ({ comment }) => {
  const formattedDate = moment(comment.createdAt).format("MMM D, HH:mm A");

  return (
    <Card sx={{mt: 2}}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <p>{comment.reviewerId.username}</p>
          <p>Commented on {formattedDate}</p>
        </Box>
        <Divider />
        <p className="text-base font-normal">{comment.comment}</p>
      </CardContent>
    </Card>
  );
};
